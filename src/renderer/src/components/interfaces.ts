export interface TelemetryData {
  gps: { lat: number; lon: number }
  altitude: number
  battery: number
  speed: number
}

export interface GenericChartProps {
    telemetry: TelemetryData | null
    id: string
    valueKey: keyof TelemetryData
    color?: string
    yLabel?: string
    yRange?: [number, number]
    title?: string
}