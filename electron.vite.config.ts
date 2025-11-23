import { resolve, dirname, join } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
//import cesium from 'vite-plugin-cesium'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { createRequire } from 'module'

// SciChart WASM dosyasının tam yolunu bulmaya çalışalım
// Genellikle scichart paketi içinde _wasm klasöründedir.
// require.resolve('scichart') genellikle ana giriş noktasını verir (index.js gibi).
// Buradan yukarı çıkıp _wasm klasörünü hedefleyeceğiz.
const require = createRequire(import.meta.url);
const scichartPath = dirname(require.resolve('scichart/package.json'));
const wasmSrc = join(scichartPath, '_wasm');

const cesiumPath = join(dirname(require.resolve('cesium/package.json')), 'Build', 'Cesium')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    base: './',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      //cesium(),
      viteStaticCopy({
        targets: [
          {
            // Dinamik olarak bulunan yolu kullanıyoruz
            src: join(wasmSrc, 'scichart2d.wasm'),
            dest: '.'
          },
          {
            src: join(cesiumPath, '*'),
            dest: 'cesium'
          }
        ]
      })
    ]
  },
})
