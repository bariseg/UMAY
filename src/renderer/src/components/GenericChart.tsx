import React, { useRef, useLayoutEffect, useEffect } from 'react'
import { GenericChartProps } from '../interfaces/interfaces'
import {
    SciChartSurface,
    NumericAxis,
    XyDataSeries,
    FastLineRenderableSeries,
    SciChartJSDarkTheme,
    NumberRange,
    EAutoRange
} from 'scichart'

const MAX_DATA_POINTS = 500
let xIndex = 0

const GenericChart: React.FC<GenericChartProps> = (props) => {
    const sciChartRef = useRef<SciChartSurface | null>(null)
    const dataSeriesRef = useRef<XyDataSeries | null>(null)
    const chartDivRef = useRef<HTMLDivElement>(null)
    const maxValueRef = useRef<number>(0)
    const yAxisRef = useRef<NumericAxis | null>(null)

    useLayoutEffect(() => {
        const initSciChart = async () => {
            SciChartSurface.UseCommunityLicense()
            const { sciChartSurface, wasmContext } = await SciChartSurface.create(chartDivRef.current!)
            sciChartSurface.applyTheme(new SciChartJSDarkTheme())

            const xAxis = new NumericAxis(wasmContext, {
                autoRange: EAutoRange.Always,
            })

            const yAxis = new NumericAxis(wasmContext, {
                visibleRange: props.yRange ? new NumberRange(...props.yRange) : new NumberRange(0, 100),
                autoRange: EAutoRange.Always,
                axisTitle: props.yLabel || '',
                autoTicks : true
            })
            yAxisRef.current = yAxis

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
                stroke: props.color || '#4682b4',
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
        if (!props.telemetry || !dataSeriesRef.current || !yAxisRef.current) {
            return
        }
        const value = props.telemetry[props.valueKey] as number
        dataSeriesRef.current.append(xIndex, value)
        if (dataSeriesRef.current.count() > MAX_DATA_POINTS) {
            dataSeriesRef.current.removeAt(0)
        }
        xIndex += 0.5

        // Maksimum değeri güncelle
        if (Math.abs(value) > maxValueRef.current) {
            maxValueRef.current = Math.abs(value)
            // Y eksenini maksimum değerin 2 katı olarak ayarla
            const yMax = maxValueRef.current * 2
            const yMin = value < 0 ? -yMax : 0 // Negatif değerler varsa simetrik yap
            yAxisRef.current.visibleRange = new NumberRange(yMin, yMax)
        }
    }, [props.telemetry])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {props.title && (
                <div style={{ color: '#fff', textAlign: 'center', fontSize: '1em', marginBottom: 4 }}>{props.title}</div>
            )}
            <div id={props.id} ref={chartDivRef} style={{ width: '100%', height: props.title ? 'calc(100% - 24px)' : '100%' }} />
        </div>
    )
}

export default GenericChart
