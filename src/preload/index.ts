// src/preload/index.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// 1. Alacağımız verinin tipini (şeklini) tanımla
export interface TelemetryData {
  gps: { lat: number; lon: number }
  altitude: number
  battery: number
  speed: number
}

// 2. Güvenli köprüyü kur: 'window.api'
contextBridge.exposeInMainWorld('api', {
  /**
   * Main process'ten gelen 'data-update' kanalını dinler.
   * Gelen veriyi bir callback fonksiyonu ile React bileşenine iletir.
   */
  onDataUpdate: (callback: (data: TelemetryData) => void) => {
    
    // 'data-update' kanalını dinle
    const listener = (event: IpcRendererEvent, data: TelemetryData) => {
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