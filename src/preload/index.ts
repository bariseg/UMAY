// src/preload/index.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// 1. Alacağımız verinin tipini (şeklini) tanımla
export interface TelemetryData {
  gps: { lat: number; lon: number }
  altitude: number
  battery: number
  speed: number
  heading: number // Yön açısı (derece, 0-360, 0=Kuzey, 90=Doğu, 180=Güney, 270=Batı)
  roll : number
  pitch : number
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  message?: string
}

// 2. Güvenli köprüyü kur: 'window.api'
contextBridge.exposeInMainWorld('api', {
  connect: () => ipcRenderer.send('connect'),
  disconnect: () => ipcRenderer.send('disconnect'),
  onConnectionStatus: (callback: (status: ConnectionStatus) => void) => {
    const listener = (_event: IpcRendererEvent, status: ConnectionStatus) => callback(status)
    ipcRenderer.on('connection-status', listener)
    return () => ipcRenderer.removeListener('connection-status', listener)
  },
  /**
   * Main process'ten gelen 'data-update' kanalını dinler.
   * Gelen veriyi bir callback fonksiyonu ile React bileşenine iletir.
   */
  onDataUpdate: (callback: (data: TelemetryData) => void) => {

    // 'data-update' kanalını dinle
    const listener = (_event: IpcRendererEvent, data: TelemetryData) => {
      callback(data)
    }
    ipcRenderer.on('data-update', listener)

    // React bileşeni "unmount" olduğunda (ekrandan kalktığında)
    // bu dinleyiciyi bellekten temizlemek için bir 'cleanup' fonksiyonu döndür.
    return () => {
      ipcRenderer.removeListener('data-update', listener)
    }
  }
})