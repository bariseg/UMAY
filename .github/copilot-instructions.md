# UMAY App - AI Coding Agent Instructions

## 🏗 Project Architecture
- **Type:** Electron application with React (Vite) and TypeScript.
- **Structure:**
  - `src/main/`: Main process (Node.js). Handles hardware (SerialPort), Protobuf decoding, and window management.
  - `src/preload/`: Preload script. Exposes safe IPC bridge (`window.api`) to Renderer.
  - `src/renderer/`: Renderer process (React). Handles UI, SciChart, and Cesium visualizations.
- **Data Flow:**
  1. **Hardware:** XBee/Serial data received in `src/main/index.ts`.
  2. **Decoding:** Custom framing (4-byte length prefix) -> Protobuf (`iha_telemetry`) -> Plain JS Object.
  3. **IPC:** Main sends `TelemetryData` to Renderer via `data-update` channel.
  4. **UI:** `App.tsx` distributes data to `CesiumMap`, `GenericChart`, etc.

## 🛠 Critical Workflows
- **Development:** `npm run dev` (starts Electron with Vite HMR).
- **Build:** `npm run build:win` (or `:mac`, `:linux`).
- **Protobuf Generation:**
  - Run `npm run proto1` & `npm run proto2` to generate JS/TS definitions in `src/main/proto`.
- **Simulation Mode:**
  - To test without hardware, uncomment `startDataSimulation(mainWindow)` in `src/main/index.ts` and comment out `startXBeeConnection`.

## 🧩 Key Patterns & Conventions
- **IPC Bridge:**
  - Defined in `src/preload/index.ts`.
  - Exposed as `window.api`.
  - Pattern: `onDataUpdate(callback)` for one-way telemetry stream.
- **Serial Communication:**
  - Logic in `src/main/index.ts` -> `startXBeeConnection`.
  - **Framing:** 4-byte Big Endian length prefix followed by Protobuf payload.
  - **Auto-detection:** Scans ports for specific Vendor IDs (`XBEE_VENDOR_IDS`).
- **SciChart Integration (`GenericChart.tsx`):**
  - Uses `useLayoutEffect` for initialization and `useEffect` for data updates.
  - **Caution:** `xIndex` is currently a module-level variable. Be aware of shared state if multiple charts are active.
- **Cesium Integration:**
  - Requires strict CSP rules in `src/main/index.ts` (script-src, worker-src, etc.).
  - Component: `src/renderer/src/components/CeisumMap.tsx`.

## 📦 External Dependencies
- **UI/Viz:** `scichart` (Community License), `cesium`.
- **System:** `serialport`, `protobufjs`.
- **Build:** `electron-builder`, `electron-vite`.

## 🚨 Common Pitfalls
- **CSP:** Modifying CSP in `src/main/index.ts` can break Cesium/SciChart (WASM/Workers).
- **Protobuf:** `iha_telemetry` import in Main process relies on generated files. Always regenerate after `.proto` changes.
- **Shared State:** Watch out for global variables in component files (e.g., `xIndex` in `GenericChart.tsx`).
