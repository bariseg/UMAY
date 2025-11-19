// src/renderer/src/App.tsx
import { useState, useEffect, JSX } from 'react'
import { TelemetryData } from './components/interfaces'
import CesiumMap from './components/CeisumMap'
import GenericChart from './components/GenericChart'
import SideViewChart from './components/SideViewChart'

const api = window.api

function App(): JSX.Element {
  // Gelen telemetri verisini tutacağımız 'state'
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  useEffect(() => {
    const cleanupListener = api.onDataUpdate((data) => {
      setTelemetry(data)
    })
    return () => {
      cleanupListener()
    }
  }, [])

  return (
    <div className="layout-container">
      {/* ÜST BAR */}
      <header className="header-bar">
        <h1>UMAY Sistem - GTU KUZGUN</h1>
        <span>Baglanti</span>

        <div className="telemetry-display">

          {/* Anlık sayısal verileri göster */}
          <span>İrtifa: {telemetry?.altitude.toFixed(1) ?? '...'} m</span>
          <span>Batarya: {telemetry?.battery.toFixed(2) ?? '...'} V</span>
          <span>Hız: {telemetry?.speed.toFixed(1) ?? '...'} km/s</span>

        </div>
      </header>

      <main className="main-content">

        <div className="panel-map">

          {/* Sol Üst - Cesium Harita */}
          <div className="component-wrapper">
            <CesiumMap telemetry={telemetry} />
          </div>

          {/* Sağ Üst - Placeholder */}
          <div className="component-wrapper">
            <GenericChart
              id="altitude1"
              telemetry={telemetry}
              valueKey="altitude"
              color="#a70404ff"
              yRange={[0, 150]}
              title="İrtifa Grafiği"
            />
          </div>

          {/* Sol Alt - Yandan Görünüm */}
          <div className="component-wrapper">
            <SideViewChart
              id="side-view"
              telemetry={telemetry}
              yRange={[0, 150]}
              xRange={[0, 100]}
              title="Yandan Görünüm"
            />
          </div>

          {/* Sağ Alt - Placeholder */}
          <div className="component-wrapper">
            <GenericChart
              id="altitude3"
              telemetry={telemetry}
              valueKey="altitude"
              color="#a70404ff"
              yRange={[0, 150]}
              title="İrtifa Grafiği"
            />
          </div>

        </div>

        {/* GRAFİK PANELİ */}
        <div className="panel-charts">

          <div className="component-wrapper">
            <GenericChart
              id="altitude"
              telemetry={telemetry}
              valueKey="altitude"
              color="#a70404ff"
              yRange={[0, 150]}
              title="İrtifa Grafiği"
            />
          </div>
          <div className="component-wrapper">
            <GenericChart
              id="altitude42"
              telemetry={telemetry}
              valueKey="altitude"
              color="#a70404ff"
              yRange={[0, 150]}
              title="İrtifa Grafiği"
            />
          </div>
          <div className="component-wrapper">
            <GenericChart
              id="battery"
              telemetry={telemetry}
              valueKey="battery"
              color="#00bfff"
              yRange={[0, 20]}
              title="Batarya Voltajı"
            />
          </div>


        </div>
      </main>
    </div>
  )
}

export default App