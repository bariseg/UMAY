// src/renderer/src/App.tsx
import { useState, useEffect, JSX } from 'react'
import { TelemetryData } from './components/interfaces'
import AltitudeChart from './components/AltitudeChart'
import CesiumMap from './components/CeisumMap'
// import CesiumMap from './components/CesiumMap' // Bir sonraki adımda

// Preload'da 'window.api' olarak expose ettiğimiz API'a eriş
const api = window.api

function App(): JSX.Element {
  // Gelen telemetri verisini tutacağımız 'state'
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)

  // Bu useEffect, bileşen yüklendiğinde SADECE BİR KEZ çalışır
  useEffect(() => {
    // Main process'ten gelen 'data-update' olayını dinle
    const cleanupListener = api.onDataUpdate((data) => {
      // Gelen her yeni veride 'telemetry' state'ini güncelle
      setTelemetry(data)
    })

    // Bileşen ekrandan kaldırılırsa (unmount) listener'ı temizle
    // Bu, bellek sızıntılarını (memory leak) önler.
    return () => {
      cleanupListener()
    }
  }, []) // Boş dependency array '[]' = "sadece bir kez çalış"

  return (
    <div className="layout-container">
      {/* ÜST BAR */}
      <header className="header-bar">
        <h1>UMAY İHA Yer İstasyonu</h1>
        <div className="telemetry-display">
          {/* Anlık sayısal verileri göster */}
          <span>İrtifa: {telemetry?.altitude.toFixed(1) ?? '...'} m</span>
          <span>Batarya: {telemetry?.battery.toFixed(2) ?? '...'} V</span>
          <span>Hız: {telemetry?.speed.toFixed(1) ?? '...'} km/s</span>
        </div>
      </header>

      <main className="main-content">

        {/* HARİTA PANELİ */}
        <div className="panel-map">
          <h2>3D Harita (Cesium)</h2>

          {/* YENİ WRAPPER (SARMALAYICI) DIV */}
          <div className="component-wrapper">
            <CesiumMap telemetry={telemetry} />
          </div>

        </div>

        {/* GRAFİK PANELİ */}
        <div className="panel-charts">
          <h3>İrtifa Grafiği</h3>

          {/* YENİ WRAPPER (SARMALAYICI) DIV */}
          <div className="component-wrapper">
            <AltitudeChart telemetry={telemetry} />
          </div>

          {/* TODO: Diğer grafikler de buraya eklenebilir */}
          {/* <h3>Batarya Grafiği</h3>
          <div className="component-wrapper">
             <BatteryChart telemetry={telemetry} /> 
          </div>
          */}
        </div>
      </main>
    </div>
  )
}

export default App