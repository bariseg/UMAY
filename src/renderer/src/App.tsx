// src/renderer/src/App.tsx
import { useState, useEffect, JSX } from 'react'
import { TelemetryData, ConnectionStatus } from './interfaces/interfaces'
import CesiumMap from './components/CeisumMap'
import GenericChart from './components/GenericChart'
//import SideViewChart from './components/SideViewChart'
import VirtualHorizon from './components/VirtualHorizon'
import WebGPUSideView from './components/SideViewWebGPU'

const api = window.api

function App(): JSX.Element {
  // Gelen telemetri verisini tutacağımız 'state'
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'disconnected' })

  useEffect(() => {
    const cleanupListener = api.onDataUpdate((data) => {
      setTelemetry(data)
    })
    const cleanupStatus = api.onConnectionStatus((status) => {
      setConnectionStatus(status)
    })
    return () => {
      cleanupListener()
      cleanupStatus()
    }
  }, [])

  const handleConnectToggle = () => {
    if (connectionStatus.status === 'connected' || connectionStatus.status === 'connecting') {
      api.disconnect()
    } else {
      api.connect()
    }
  }

  return (
    <div className="layout-container">
      {/* ÜST BAR */}
      <header className="header-bar">
        <h1>UMAY Sistem - GTU KUZGUN</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleConnectToggle}
            disabled={connectionStatus.status === 'connecting'}
            style={{
              padding: '5px 15px',
              backgroundColor: connectionStatus.status === 'connected' ? '#d32f2f' : '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {connectionStatus.status === 'connected' ? 'Bağlantıyı Kes' : 'Bağlan'}
          </button>
          <span style={{ fontSize: '0.9em', color: '#ccc' }}>
            {
              connectionStatus.status === 'connected' ? 'Bağlı' :
                connectionStatus.status === 'connecting' ? 'Bağlanıyor...' :
                  connectionStatus.status === 'error' ? `Hata: ${connectionStatus.message}` : 'Bağlantı Yok'
            }
          </span>
        </div>

        <div className="telemetry-display">

          {/* Anlık sayısal verileri göster */}
          {/* <span>İrtifa: {telemetry?.altitude.toFixed(1) ?? '...'} m</span>
          <span>Batarya: {telemetry?.battery.toFixed(2) ?? '...'} V</span>
          <span>Hız: {telemetry?.speed.toFixed(1) ?? '...'} km/s</span> */}

        </div>
      </header>

      <main className="main-content">

        <div className="panel-map">

          {/* Sol Üst - Cesium Harita */}
          <div className="component-wrapper">
            <CesiumMap telemetry={telemetry} />
          </div>

          {/* Sağ Üst - SANAL UFUK */}
          <div className="component-wrapper">
            <VirtualHorizon telemetry={telemetry} />
          </div>

          {/* Sol Alt - Yandan Görünüm */}
          <div className="component-wrapper">
            {/* <SideViewChart
              id="side-view"
              telemetry={telemetry}
              yRange={[0, 150]}
              xRange={[0, 100]}
              title="Yandan Görünüm"
            />
 */}
            <WebGPUSideView
              telemetry={telemetry}
              id='side-view'
              title='Yandan Görünüm'
              yRange={[0, 150]}
            />


          </div>

          {/* Sağ Alt - Placeholder */}
          <div className="component-wrapper">
            buraya kamera görüntüsü gelebilir
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