import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

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
      contextIsolation: true, //burasini silmemiz gerekebilir baris
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
    console.log('Renderer yüklendi, simülasyon başlıyor.')
    startDataSimulation(mainWindow) // Fonksiyonu burada çağır
  })

}

const startDataSimulation = (window: BrowserWindow) => {
  let altitude = 100
  let battery = 12.6
  let lat = 41.015137 // İstanbul
  let lon = 28.97953

  setInterval(() => {
    // Veriyi rastgele güncelle
    altitude += (Math.random() - 0.5) * 1
    battery -= 0.001
    lat += 0.00003 * (Math.random() - 0.5)
    lon += 0.00003 * (Math.random() - 0.5)

    const telemetryData = {
      gps: { lat, lon },
      altitude: parseFloat(altitude.toFixed(2)),
      battery: parseFloat(battery.toFixed(2)),
      speed: parseFloat((20 + (Math.random() - 0.5) * 2).toFixed(2))
    }

    // Veriyi 'data-update' kanalı üzerinden Renderer'a gönder
    if (window && !window.isDestroyed()) {
      window.webContents.send('data-update', telemetryData)
    }
  }, 500) // Saniyede 2 kez
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
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
