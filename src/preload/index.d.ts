import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onDataUpdate: (callback: (data: TelemetryData) => void) => () => void
    }
  }
}
