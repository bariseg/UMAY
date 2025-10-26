// src/renderer/src/components/AltitudeChart.tsx
import React, { useRef, useLayoutEffect, useEffect } from 'react'
import { TelemetryData } from './interfaces' // Tipi almak için 3 seviye yukarı çık
import {
    SciChartSurface,
    NumericAxis,
    XyDataSeries,
    FastLineRenderableSeries,
    SciChartJSDarkTheme,
    NumberRange,
    EAutoRange
} from 'scichart'

// Bileşenin dışarıdan alacağı prop'ları (veriyi) tanımla
interface AltitudeChartProps {
    telemetry: TelemetryData | null
}

// Grafik için ayarlar
const MAX_DATA_POINTS = 500 // Ekranda kaç nokta tutulacağı
let xIndex = 0 // Başlangıç X ekseni değeri

const AltitudeChart: React.FC<AltitudeChartProps> = ({ telemetry }) => {
    const sciChartRef = useRef<SciChartSurface | null>(null)
    const dataSeriesRef = useRef<XyDataSeries | null>(null)
    const chartDivRef = useRef<HTMLDivElement>(null)

    // 1. GRAFİĞİ BAŞLAT (useLayoutEffect, DOM boyanmadan hemen önce çalışır)
    useLayoutEffect(() => {
        const initSciChart = async () => {

            // Topluluk lisansını kullan (veya ücretli anahtarın varsa setRuntimeLicenseKey)
            SciChartSurface.UseCommunityLicense()

            // Grafiği oluştur ve 'chartDivRef' div'ine bağla
            const { sciChartSurface, wasmContext } = await SciChartSurface.create(chartDivRef.current!)
            sciChartSurface.applyTheme(new SciChartJSDarkTheme()) // Koyu tema

            // X Ekseni (Zaman/Index)
            const xAxis = new NumericAxis(wasmContext, {
                autoRange: EAutoRange.Never, // X ekseni veriyi takip etsin
                visibleRangeLimit: new NumberRange(0, MAX_DATA_POINTS)
            })

            // Y Ekseni (İrtifa)
            const yAxis = new NumericAxis(wasmContext, {
                autoRange: EAutoRange.Never // Y ekseni veriye göre zoom yapsın
            })

            sciChartSurface.xAxes.add(xAxis)
            sciChartSurface.yAxes.add(yAxis)

            // 2. Veri serisini oluştur (X ve Y noktalarını tutar)
            const dataSeries = new XyDataSeries(wasmContext, {
                capacity: MAX_DATA_POINTS // Performans için kapasite belirt
            })
            dataSeriesRef.current = dataSeries // Daha sonra erişmek için ref'e kaydet

            // 3. Çizgi serisini oluştur (Veriyi ekranda çizer)
            const lineSeries = new FastLineRenderableSeries(wasmContext, {
                dataSeries: dataSeries,
                stroke: '#4682b4', // Çizgi rengi
                strokeThickness: 2
            })

            sciChartSurface.renderableSeries.add(lineSeries)

            // Oluşturulan yüzeyi daha sonra silmek için ref'e kaydet
            sciChartRef.current = sciChartSurface
        }

        initSciChart()

        // Cleanup: Bileşen ekrandan kaldırıldığında grafiği bellekten sil
        return () => {
            sciChartRef.current?.delete()
        }
    }, []) // Boş array '[]' = "sadece bir kez çalış"

    // 2. VERİYİ GÜNCELLE (useEffect, 'telemetry' prop'u her değiştiğinde çalışır)
    useEffect(() => {
        // Henüz telemetri veya grafik hazır değilse bir şey yapma
        if (!telemetry || !dataSeriesRef.current) {
            return
        }

        // Yeni veriyi (xIndex, irtifa) grafiğe ekle
        dataSeriesRef.current.append(xIndex, telemetry.altitude)

        // Eğer veri noktası sayısı MAX_DATA_POINTS'i aştıysa, ilk noktayı sil (FIFO)
        if (dataSeriesRef.current.count() > MAX_DATA_POINTS) {
            dataSeriesRef.current.removeAt(0)
        }

        xIndex++ // X eksenini bir artır
    }, [telemetry]) // Bu effect, 'telemetry' her değiştiğinde tetiklenir

    // HTML (JSX) olarak grafiğin render edileceği div'i döndür
    return <div ref={chartDivRef} style={{ width: '100%', height: '100%' }} />
}

export default AltitudeChart