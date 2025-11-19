// src/renderer/src/components/CesiumMap.tsx
import React, { useRef, useEffect } from 'react'
import {
  Viewer,
  Entity,
  PointGraphics,
  Cartesian3,
  Color,
  SampledPositionProperty,
  JulianDate,
  Math as CesiumMath
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
  const positionPropertyRef = useRef<SampledPositionProperty | null>(null) // Akıcı pozisyon için referans
  const headingRef = useRef<number>(0) // Yön açısı (radyan) - telemetriden güncellenecek
  const sampleCountRef = useRef<number>(0) // Sample sayacı

  // 1. HARİTAYI BAŞLAT (Sadece bir kez)
  useEffect(() => {
    if (mapDivRef.current && !viewerRef.current) {
      const viewer = new Viewer(mapDivRef.current, {
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

      // SampledPositionProperty ile akıcı pozisyon (Linear interpolation için)
      const positionProperty = new SampledPositionProperty()
      positionProperty.setInterpolationOptions({
        interpolationDegree: 1 // Linear interpolation - yumuşak geçişler
      })
      positionPropertyRef.current = positionProperty

      // Başlangıç pozisyonu (İstanbul)
      const startPosition = Cartesian3.fromDegrees(28.97953, 41.015137, 100)
      const startTime = JulianDate.now()
      positionProperty.addSample(startTime, startPosition)
      const nextTime = JulianDate.addSeconds(startTime, 1, new JulianDate())
      positionProperty.addSample(nextTime, startPosition)

      // Viewer clock'u başlat
      viewer.clock.shouldAnimate = true
      
      // Kamera inertia ayarları (yumuşak hareket için)
      viewer.scene.screenSpaceCameraController.inertiaSpin = 0.9
      viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.9
      viewer.scene.screenSpaceCameraController.inertiaZoom = 0.8

      // Ana merkez noktası (İHA konumu)
      uavEntityRef.current = viewer.entities.add({
        id: 'uav',
        name: 'İHA',
        position: positionProperty,
        // Merkez nokta - İHA gövdesi
        point: new PointGraphics({
          pixelSize: 8,
          color: Color.YELLOW,
          outlineColor: Color.BLACK,
          outlineWidth: 2
        })
      })
      
      viewerRef.current = viewer

      // Kamerayı arkadan takip edecek şekilde ayarla
      viewer.trackedEntity = uavEntityRef.current
      
      // Kamera offset ayarları (İHA'nın arkasından takip)
      viewer.scene.postUpdate.addEventListener(() => {
        if (!viewer.trackedEntity || viewer.scene.mode !== 3) return // Sadece 3D modda
        
        const camera = viewer.camera
        const entity = viewer.trackedEntity
        
        if (entity && entity.position) {
          const position = entity.position.getValue(viewer.clock.currentTime)
          if (position) {
            // Kamerayı İHA'nın arkasında konumlandır
            const heading = headingRef.current
            const distance = 150
            const height = 50
            
            // Offset hesapla (arkada ve yukarıda)
            const offset = new Cartesian3(
              -distance * Math.sin(heading),
              -distance * Math.cos(heading),
              height
            )
            
            // lookAt ile kamerayı ayarla (read-only property'leri değiştirmez)
            camera.lookAt(
              position,
              offset
            )
          }
        }
      })

    }

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [])

  // 2. VERİYİ GÜNCELLE (Telemetri her değiştiğinde çalışır)
  useEffect(() => {
    if (!telemetry || !viewerRef.current || !uavEntityRef.current || !positionPropertyRef.current) {
      return
    }

    const { lat, lon } = telemetry.gps
    const altitude = telemetry.altitude
    const newPosition = Cartesian3.fromDegrees(lon, lat, altitude)
    const now = JulianDate.now()

    // SampledPositionProperty ile yeni pozisyonu ekle
    positionPropertyRef.current.addSample(now, newPosition)
    sampleCountRef.current++

    // Memory optimizasyonu: Her 100 sample'da bir eski verileri temizle
    if (sampleCountRef.current % 100 === 0) {
      // Yeni bir SampledPositionProperty oluştur ve son pozisyonu ekle
      const newPositionProperty = new SampledPositionProperty()
      newPositionProperty.setInterpolationOptions({
        interpolationDegree: 1 // Linear interpolation
      })
      // Son pozisyonu yeni property'e ekle
      newPositionProperty.addSample(now, newPosition)
      const futureTime = JulianDate.addSeconds(now, 1, new JulianDate())
      newPositionProperty.addSample(futureTime, newPosition)
      
      // Entity'nin position'ını güncelle
      if (uavEntityRef.current) {
        uavEntityRef.current.position = newPositionProperty
      }
      positionPropertyRef.current = newPositionProperty
      sampleCountRef.current = 0
    }

    // Heading'i güncelle (derece -> radyan)
    const headingRadians = CesiumMath.toRadians(telemetry.heading)
    headingRef.current = headingRadians

  }, [telemetry])

  return (
    <div
      ref={mapDivRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default CesiumMap