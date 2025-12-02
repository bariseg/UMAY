import { BrowserWindow } from "electron"
import { SerialPort } from "serialport"
import { TelemetryData } from "../../preload"
import { iha_telemetry } from "../proto/telemetry"

const XBEE_VENDOR_IDS = ['10c4', '0403', '2341']
let xbeePort: SerialPort | null = null

export function closeXBeePort() {
    if (xbeePort && xbeePort.isOpen) {
        xbeePort.close()
    }
}
export async function findXBeePortPath(): Promise<string | null> {
    try {
        // 1. Tüm aktif seri portları listele
        const ports = await SerialPort.list()

        console.log('Bulunan Tüm Portlar:', ports.map(p => `${p.path} (${p.manufacturer})`))

        // 2. Listeyi filtrele: Bizim Vendor ID'lerden biriyle eşleşen var mı?
        const foundPort = ports.find(port => {
            // vendorId bazen undefined olabilir, kontrol ediyoruz
            if (!port.vendorId) return false

            return XBEE_VENDOR_IDS.includes(port.vendorId.toLowerCase())
        })

        if (foundPort) {
            console.log(`OTOMATİK TESPİT: XBee cihazı ${foundPort.path} üzerinde bulundu.`)
            return foundPort.path
        } else {
            console.warn('UYARI: Bilinen bir XBee adaptörü bulunamadı. İlk uygun port denenecek...')

            // Eğer spesifik ID bulamazsak, "Bluetooth" olmayan ilk USB portunu döndür
            // MacOS'ta bluetooth portları çok kalabalık yapar.
            const fallbackPort = ports.find(p => !p.path.includes('Bluetooth') && (p.path.includes('usb') || p.path.includes('COM')))
            return fallbackPort ? fallbackPort.path : null
        }

    } catch (err) {
        console.error('Port tarama hatası:', err)
        return null
    }
}

// Buffer yönetimi için global değişken (Fonksiyonun dışında değil, içinde tanımlı kalsın ki her bağlantıda sıfırlansın)
export const startXBeeConnection = async (window: BrowserWindow) => {
    if (xbeePort && xbeePort.isOpen) {
        console.log('Port zaten açık.')
        return
    }

    console.log('XBee modülü aranıyor...')
    window.webContents.send('connection-status', { status: 'connecting', message: 'Aranıyor...' })

    const autoPath = await findXBeePortPath()
    if (!autoPath) {
        window.webContents.send('connection-status', { status: 'error', message: 'Port bulunamadı' })
        return
    }

    // Sınıf kontrolü (Artık import doğrudan çalıştığı için bu basit kontrol yeterli)
    if (!iha_telemetry || !iha_telemetry.FlightData) {
        console.error('🛑 KRİTİK HATA: FlightData sınıfı import edilemedi!');
        window.webContents.send('connection-status', { status: 'error', message: 'Proto hatası' })
        return;
    }

    console.log('✅ FlightData Sınıfı Başarıyla Yüklendi!');

    xbeePort = new SerialPort({
        path: autoPath,
        baudRate: 9600,
        autoOpen: false,
    })

    let incomingBuffer = Buffer.alloc(0);

    xbeePort.open((err) => {
        if (err) {
            console.log('Port hatası:', err.message);
            window.webContents.send('connection-status', { status: 'error', message: err.message })
            return
        }
        console.log(`BAŞARILI: ${autoPath} dinleniyor.`);
        window.webContents.send('connection-status', { status: 'connected', portName: autoPath })
        xbeePort?.set({ rts: true, dtr: true });
    })

    xbeePort.on('close', () => {
        console.log('Port kapandı.')
        window.webContents.send('connection-status', { status: 'disconnected' })
        xbeePort = null
    })

    xbeePort.on('error', (err) => {
        console.log('Port hatası:', err)
        window.webContents.send('connection-status', { status: 'error', message: err.message })
    })

    xbeePort.on('data', (chunk: Buffer) => {
        incomingBuffer = Buffer.concat([incomingBuffer, chunk]);

        while (true) {
            if (incomingBuffer.length < 4) break;
            const messageLength = incomingBuffer.readUInt32BE(0);
            if (incomingBuffer.length < 4 + messageLength) break;

            const messageBuffer = incomingBuffer.subarray(4, 4 + messageLength);

            try {
                // --- DECODE ---
                // Doğrudan import ettiğimiz sınıfı kullanıyoruz
                const decodedMessage = iha_telemetry.FlightData.decode(messageBuffer);

                const objectData = iha_telemetry.FlightData.toObject(decodedMessage, {
                    longs: Number,
                    enums: String,
                    bytes: String,
                });

                const telemetryData: TelemetryData = {
                    gps: {
                        lat: objectData.latitude || 0,
                        lon: objectData.longitude || 0
                    },
                    altitude: objectData.altitude || 0,
                    battery: objectData.battery || 0,
                    speed: objectData.speed || 0,
                    heading: objectData.heading || 0,
                    roll: 0,
                    pitch: 0
                };

                if (window && !window.isDestroyed()) {
                    window.webContents.send('data-update', telemetryData);
                }

            } catch (e) {
                console.error('Decode Hatası:', e);
            }

            incomingBuffer = incomingBuffer.subarray(4 + messageLength);
        }
    });
}

/* 
const startXBeeConnection = async (window: BrowserWindow) => {

  console.log('XBee modülü aranıyor...')

  // Otomatik port bulucuyu çağır
  const autoPath = await findXBeePortPath()

  if (!autoPath) {
    console.error('HATA: Hiçbir uygun seri port bulunamadı! Lütfen XBee bağlantısını kontrol edin.')
    // Kullanıcıya hata gönderebilirsin
    return
  }

  const baudRate = 9600

  const port = new SerialPort({
    path: autoPath, // Artık hardcoded 'COM3' değil, bulunan portu kullanıyoruz
    baudRate: baudRate,
    autoOpen: false,
  })

  port.open((err) => {
    if (err) console.log('Port açma hatası:', err.message)
    else console.log('Port açıldı, veri bekleniyor...')
  })

  port.on('data', (data: Buffer) => {
    try {

      console.log('Gelen Ham Veri (Buffer):', data)
      // Gelen Buffer verisini Protobuf ile çöz
      // 'FlightData', .proto dosyasındaki 'message FlightData' ismidir.
      const decodedMessage = proto.iha_telemetry.FlightData.decode(data)

      // Protobuf mesajını normal JavaScript objesine çevir
      const objectData = proto.iha_telemetry.FlightData.toObject(decodedMessage, {
        longs: Number, // int64 sayılarını Number'a çevir
        enums: String,
        bytes: String,
      })

      console.log('Çözülen Veri:', objectData)

      // Map to TelemetryData interface
      const telemetryData: TelemetryData = {
        gps: {
          lat: objectData.latitude || 0,
          lon: objectData.longitude || 0
        },
        altitude: objectData.altitude || 0,
        battery: objectData.battery || 0,
        speed: objectData.speed || 0,
        heading: objectData.heading || 0,
        roll: 0, // Not in proto
        pitch: 0 // Not in proto
      }

      // React tarafına gönder
      if (window && !window.isDestroyed()) {
        window.webContents.send('data-update', telemetryData)
      }

    } catch (e) {
      // Veri parçalı geldiyse decode hata verir, bu normaldir.
      // İleride buraya "packet framing" ekleyeceğiz.
      // console.log('Paket tamamlanmadı veya hatalı:', e)
    }
  })
}  */
