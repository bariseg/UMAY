import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SciChartSurface } from 'scichart'


SciChartSurface.configure({
  dataUrl: '/scichart2d.js',
  wasmUrl: '/scichart2d.wasm'
} as any)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
