import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { closeXBeePort, startXBeeConnection } from './utilities/telemetryConnection'
import { startDataSimulation } from './utilities/dataSimulation'


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

  ipcMain.on('connect', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) startXBeeConnection(win)
  })

  ipcMain.on('disconnect', () => {
    closeXBeePort()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin') {
    app.quit()
  //}
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    darkTheme: true,
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

    startDataSimulation(mainWindow)
    //startXBeeConnection(mainWindow) // Otomatik başlatma kaldırıldı
  })
}



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
