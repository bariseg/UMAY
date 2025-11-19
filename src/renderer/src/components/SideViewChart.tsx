import React, { useRef, useLayoutEffect, useEffect } from 'react'
import { TelemetryData } from './interfaces'
import {
    SciChartSurface,
    NumericAxis,
    XyDataSeries,
    SciChartJSDarkTheme,
    NumberRange,
    EAutoRange,
    EAxisAlignment,
    AxisMarkerAnnotation
} from 'scichart'

interface SideViewChartProps {
    id: string
    telemetry: TelemetryData | null
    yRange?: [number, number]
    xRange?: [number, number]
    title?: string
}

const SideViewChart: React.FC<SideViewChartProps> = (props) => {
    const sciChartRef = useRef<SciChartSurface | null>(null)
    const ihaMarkerSeriesRef = useRef<XyDataSeries | null>(null)
    const altitudeMarkerRef = useRef<AxisMarkerAnnotation | null>(null)
    const chartDivRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const initSciChart = async () => {
            SciChartSurface.UseCommunityLicense()
            const { sciChartSurface, wasmContext } = await SciChartSurface.create(chartDivRef.current!)
            sciChartSurface.applyTheme(new SciChartJSDarkTheme())

            // X ekseni - mesafe/konum
            const xAxis = new NumericAxis(wasmContext, {
                visibleRange: props.xRange ? new NumberRange(...props.xRange) : new NumberRange(0, 100),
                autoRange: EAutoRange.Never,
                axisTitle: 'Mesafe (m)',
                drawMajorGridLines: true,
                drawMinorGridLines: false
            })

            // Y ekseni - irtifa için, solda
            const yAxis = new NumericAxis(wasmContext, {
                axisAlignment: EAxisAlignment.Left,
                visibleRange: props.yRange ? new NumberRange(...props.yRange) : new NumberRange(0, 150),
                autoRange: EAutoRange.Never,
                axisTitle: 'İrtifa (m)',
                drawMajorGridLines: true,
                drawMinorGridLines: true
            })

            sciChartSurface.xAxes.add(xAxis)
            sciChartSurface.yAxes.add(yAxis)

            // İHA işaretçisi için data series
            const ihaMarkerSeries = new XyDataSeries(wasmContext, {
                containsNaN: false
            })
            ihaMarkerSeriesRef.current = ihaMarkerSeries


            // Y ekseninde irtifa marker'ı
            const altitudeMarker = new AxisMarkerAnnotation({
                y1: 0,
                backgroundColor: '#00ff00',
                fontSize: 12,
                fontWeight: 'bold'
            })
            sciChartSurface.annotations.add(altitudeMarker)
            altitudeMarkerRef.current = altitudeMarker

            sciChartRef.current = sciChartSurface
        }
        initSciChart()
        return () => {
            sciChartRef.current?.delete()
        }
    }, [])

    useEffect(() => {
        if (!props.telemetry || !ihaMarkerSeriesRef.current) {
            return
        }
        const altitude = props.telemetry.altitude
        
        // İHA pozisyonunu güncelle (X ekseninde ortada durur şimdilik)
        const xRange = props.xRange || [0, 100]
        const xCenter = (xRange[0] + xRange[1]) / 2
        
        ihaMarkerSeriesRef.current.clear()
        ihaMarkerSeriesRef.current.append(xCenter, altitude)
        
        // Y ekseni marker'ını güncelle
        if (altitudeMarkerRef.current) {
            altitudeMarkerRef.current.y1 = altitude
        }
    }, [props.telemetry])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {props.title && (
                <div style={{ color: '#fff', textAlign: 'center', fontSize: '1em', marginBottom: 4 }}>
                    {props.title}
                </div>
            )}
            <div 
                id={props.id} 
                ref={chartDivRef} 
                style={{ 
                    width: '100%', 
                    height: props.title ? 'calc(100% - 24px)' : '100%' 
                }} 
            />
        </div>
    )
}

export default SideViewChart
