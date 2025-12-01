import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { TelemetryData } from '../preload/index'
import { SerialPort } from 'serialport'
// import { iha_telemetry } from './proto/telemetry'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as proto from './proto/telemetry'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false
    }
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';", // Varsayılan olarak sadece kendi kaynaklarına güven
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval';", // Scriptler: Kendisi, inline (HMR), eval (Cesium), WASM (SciChart)
          "worker-src 'self' blob:;", // Worker'lar: Kendisi ve blob (Cesium)
          "img-src 'self' data: blob: *;", // Görseller: Kendisi, data:, blob: ve herhangi bir sunucu (*) (Cesium harita karoları için)
          "connect-src 'self' blob: *;", // Bağlantılar: Kendisi, blob: ve herhangi bir sunucu (*) (Cesium veri/arazi sunucuları için)
          "style-src 'self' 'unsafe-inline';" // Stiller: Kendisi ve inline (kütüphaneler)
        ].join(' ')
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Pencere yüklendiğinde simülasyonu başlat
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer yüklendi.')

    //startDataSimulation(mainWindow)
    startXBeeConnection(mainWindow)
  })
}
const XBEE_VENDOR_IDS = ['10c4', '0403', '2341']

async function findXBeePortPath(): Promise<string | null> {
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
}


// --------------------------------
/* 
const startDataSimulation = (window: BrowserWindow) => {
  let altitude = 10
  let battery = 12.6
  let lat = 41.015137
  let lon = 28.97953
  let heading = 0
  let roll = 0
  let pitch = 0

  setInterval(() => {
    altitude += (Math.random() - 0.5) * 1
    battery -= 0.001

    heading += (Math.random() - 0.5) * 5
    if (heading < 0) heading += 360
    if (heading >= 360) heading -= 360

    pitch = Math.sin(Date.now() / 1000) * 10 // -10 ile +10 derece arası
    roll = Math.cos(Date.now() / 1500) * 20  // -20 ile +20 derece arası

    const headingRad = (heading * Math.PI) / 180
    const moveDistance = 0.00002
    lat += moveDistance * Math.cos(headingRad)
    lon += moveDistance * Math.sin(headingRad)

    const telemetryData: TelemetryData = {
      gps: { lat, lon },
      altitude: parseFloat(altitude.toFixed(2)),
      battery: parseFloat(battery.toFixed(2)),
      speed: parseFloat((20 + (Math.random() - 0.5) * 2).toFixed(2)),
      heading: parseFloat(heading.toFixed(1)),
      pitch: parseFloat(pitch.toFixed(1)),
      roll: parseFloat(roll.toFixed(1))    
    }

    // Veriyi 'data-update' kanalı üzerinden Renderer'a gönder
    if (window && !window.isDestroyed()) {
      window.webContents.send('data-update', telemetryData)
    }
  }, 100)
}
 */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.