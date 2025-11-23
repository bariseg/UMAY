import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { TelemetryData } from '../preload'
import { SerialPort } from 'serialport' // EKLENDİ

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
    
    // --- SEÇİMİNİ YAP ---
    
    // YÖNTEM 1: Evde test yaparken bunu aç (Sahte Veri)
    // startDataSimulation(mainWindow) 

    // YÖNTEM 2: Gerçek XBee takılıyken bunu aç
    startXBeeConnection(mainWindow) 
  })
}

// --- XBEE BAĞLANTI FONKSİYONU ---
const startXBeeConnection = (window: BrowserWindow) => {
  // DİKKAT: Bu port adını kendi bilgisayarına göre değiştirmelisin!
  // Windows örn: 'COM3'
  // MacOS örn: '/dev/tty.usbserial-A50285BI'
  const path = 'COM3' 
  const baudRate = 9600 // XBee modüllerinin varsayılan hızı genelde 9600'dür. Yapılandırmana göre 57600 veya 115200 olabilir.

  console.log(`XBee aranıyor: ${path} hızı: ${baudRate}`)

  const port = new SerialPort({
    path: path,
    baudRate: baudRate,
    autoOpen: false, // Elle açacağız
  })

  port.open((err) => {
    if (err) {
      return console.log('HATA: Seri port açılamadı. XBee takılı mı? ', err.message)
    }
    console.log('BAŞARILI: XBee seri port bağlantısı açıldı.')
  })

  // Veri geldiğinde çalışacak olay
  port.on('data', (data: Buffer) => {
    console.log('Gelen Ham Veri (Byte):', data)

    // NOT: Burada Protobuf decode işlemi yapacaksın.
    // Şimdilik gelen veriyi doğrudan parse etmeye çalışalım veya dummy bir yapı kuralım.
    // Eğer veriyi JSON string olarak gönderiyorsan:
    /*
      try {
        const jsonString = data.toString()
        const parsedData = JSON.parse(jsonString)
        window.webContents.send('data-update', parsedData)
      } catch (e) {
        console.log('Veri parse edilemedi (Parçalı veri gelmiş olabilir)')
      }
    */

    // Şimdilik test için "Buffer" geldiğini konsola basıyoruz.
    // Gerçek senaryoda burada `telemetry.proto` decode işlemini yapacaksın.
    
    // ÖRNEK: Veri akışını React'e göstermek için (geçici):
    // Gerçek veriyi decode edene kadar React tarafı boş kalmasın diye
    // gelen her byte için console log atıyoruz.
  })

  port.on('error', (err) => {
    console.log('Seri Port Hatası: ', err.message)
  })
}
// --------------------------------

const startDataSimulation = (window: BrowserWindow) => {
  let altitude = 10
  let battery = 12.6
  let lat = 41.015137 
  let lon = 28.97953
  let heading = 0 

  setInterval(() => {
    altitude += (Math.random() - 0.5) * 1
    battery -= 0.001
    
    heading += (Math.random() - 0.5) * 5 
    if (heading < 0) heading += 360
    if (heading >= 360) heading -= 360
    
    const headingRad = (heading * Math.PI) / 180
    const moveDistance = 0.00002 
    lat += moveDistance * Math.cos(headingRad)
    lon += moveDistance * Math.sin(headingRad)

    const telemetryData : TelemetryData = {
      gps: { lat, lon },
      altitude: parseFloat(altitude.toFixed(2)),
      battery: parseFloat(battery.toFixed(2)),
      speed: parseFloat((20 + (Math.random() - 0.5) * 2).toFixed(2)),
      heading: parseFloat(heading.toFixed(1)) 
    }

    // Veriyi 'data-update' kanalı üzerinden Renderer'a gönder
    if (window && !window.isDestroyed()) {
      window.webContents.send('data-update', telemetryData)
    }
  }, 500) 
}




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