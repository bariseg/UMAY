// src/renderer/src/components/CesiumMap.tsx
import React, { useRef, useEffect } from 'react'
import {
  Viewer,
  Entity,
  PointGraphics,
  Cartesian3,
  Color,
  Ion
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css' // CSS dosyasını import et
import { TelemetryData } from './interfaces'

// İsteğe bağlı: Daha iyi harita görselleri (arazi, binalar) için
// https://ion.cesium.com/ adresinden ücretsiz bir token alabilirsin.
// Ion.defaultAccessToken = 'SENIN_TOKENIN_BURAYA';

interface MapProps {
  telemetry: TelemetryData | null
}

const CesiumMap: React.FC<MapProps> = ({ telemetry }) => {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const uavEntityRef = useRef<Entity | null>(null) // İHA'yı tutacak referans

  // 1. HARİTAYI BAŞLAT (Sadece bir kez)
  useEffect(() => {
    // div yüklendiyse ve harita henüz oluşmadıysa
    if (mapDivRef.current && !viewerRef.current) {
      const viewer = new Viewer(mapDivRef.current, {
        // Arayüzü sadeleştir
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        baseLayerPicker: false,
        sceneModePicker: false,
        infoBox: false,
        selectionIndicator: false,
      })

      // İHA için bir 'Entity' (varlık) oluştur
      uavEntityRef.current = viewer.entities.add({
        id: 'uav',
        name: 'İHA',
        // Başlangıç pozisyonu (veri gelene kadar İstanbul)
        position: Cartesian3.fromDegrees(28.97953, 41.015137, 100),
        point: new PointGraphics({
          pixelSize: 12,
          color: Color.ORANGE
        })
      })

      // Kamerayı İHA'ya kilitle
      viewer.trackedEntity = uavEntityRef.current
      viewerRef.current = viewer
    }

    // Cleanup: Bileşen ekrandan kalktığında haritayı yok et
    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, []) // Boş array '[]' = "sadece bir kez çalış"

  // 2. VERİYİ GÜNCELLE (Telemetri her değiştiğinde çalışır)
  useEffect(() => {
    // Veri yoksa veya harita/entity hazır değilse çık
    if (!telemetry || !viewerRef.current || !uavEntityRef.current) {
      return
    }

    const { lat, lon } = telemetry.gps
    const altitude = telemetry.altitude

    // Yeni pozisyonu WGS84 (enlem, boylam, yükseklik) formatından
    // Cesium'un anladığı Cartesian3 formatına çevir
    const newPosition = Cartesian3.fromDegrees(lon, lat, altitude)

    // İHA entity'sinin pozisyonunu güncelle
    uavEntityRef.current.position = newPosition as any

  }, [telemetry]) // 'telemetry' her değiştiğinde bu fonksiyonu tetikle

  return <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
}

export default CesiumMap