// src/renderer/src/components/AltitudeChart.tsx
import React, { useRef, useLayoutEffect, useEffect } from 'react'
import { TelemetryData } from './interfaces'
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
    id: string
}

const MAX_DATA_POINTS = 500
let xIndex = 0

const AltitudeChart: React.FC<AltitudeChartProps> = (props) => {
    const sciChartRef = useRef<SciChartSurface | null>(null)
    const dataSeriesRef = useRef<XyDataSeries | null>(null)
    const chartDivRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const initSciChart = async () => {

            SciChartSurface.UseCommunityLicense()

            const { sciChartSurface, wasmContext } = await SciChartSurface.create(chartDivRef.current!)
            sciChartSurface.applyTheme(new SciChartJSDarkTheme())

            // X Ekseni (Zaman/Index)
            const xAxis = new NumericAxis(wasmContext, {
                autoRange: EAutoRange.Always,
                visibleRangeLimit: new NumberRange(0, MAX_DATA_POINTS)
            })

            const yAxis = new NumericAxis(wasmContext, {
                visibleRange : new NumberRange(0,150),
                autoRange: EAutoRange.Never
            })

            sciChartSurface.xAxes.add(xAxis)
            sciChartSurface.yAxes.add(yAxis)

            const dataSeries = new XyDataSeries(wasmContext, {
                capacity: MAX_DATA_POINTS, 
                isSorted: true,
                containsNaN: false
            })
            dataSeriesRef.current = dataSeries

            const lineSeries = new FastLineRenderableSeries(wasmContext, {
                dataSeries: dataSeries,
                stroke: '#a70404ff', // Çizgi rengi
                strokeThickness: 2
            })

            sciChartSurface.renderableSeries.add(lineSeries)

            sciChartRef.current = sciChartSurface
        }

        initSciChart()

        return () => {
            sciChartRef.current?.delete()
        }
    }, [])

    useEffect(() => {

        if (!props.telemetry || !dataSeriesRef.current) {
            return
        }

        dataSeriesRef.current.append(xIndex, props.telemetry.altitude)

        // Eğer veri noktası sayısı MAX_DATA_POINTS'i aştıysa, ilk noktayı sil (FIFO)
        if (dataSeriesRef.current.count() > MAX_DATA_POINTS) {
            dataSeriesRef.current.removeAt(0)
        }

        xIndex += 0.5
    }, [props.telemetry]) 

    // HTML (JSX) olarak grafiğin render edileceği div'i döndür
    return <div id={props.id} ref={chartDivRef} style={{ width: '100%', height: '100%' }} />
}

export default AltitudeChart