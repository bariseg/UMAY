// simülasyon için
import { TelemetryData } from "../../preload"

import { BrowserWindow } from "electron"

export const startDataSimulation = (window: BrowserWindow) => {
  let altitude = 50
  let battery = 12.6
  let lat = 41.015137
  let lon = 28.97953
  let heading = 0
  let roll = 0
  let pitch = 0

  setInterval(() => {
    altitude += (Math.random() - 0.5) * 10
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