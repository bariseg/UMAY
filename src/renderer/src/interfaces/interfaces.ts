export interface TelemetryData {
  gps: { lat: number; lon: number }
  altitude: number
  battery: number
  speed: number
  heading: number // Yön açısı (derece, 0-360, 0=Kuzey, 90=Doğu, 180=Güney, 270=Batı)
  pitch : number
  roll : number
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