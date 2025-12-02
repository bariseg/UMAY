import { ElectronAPI } from '@electron-toolkit/preload'

interface TelemetryData {
  gps: { lat: number; lon: number }
  altitude: number
  battery: number
  speed: number
  heading: number
  roll : number
  pitch : number
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  message?: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onDataUpdate: (callback: (data: TelemetryData) => void) => () => void
      connect: () => void
      disconnect: () => void
      onConnectionStatus: (callback: (status: ConnectionStatus) => void) => () => void
    }
  }
}
