# ArcGIS Map Explorer

A map viewer built with **React + TypeScript + Vite** on the **ArcGIS Maps SDK
for JavaScript** (`@arcgis/core` ES modules). Switch basemaps, toggle 2D/3D,
read live cursor coordinates, and add data layers (Feature, Tile, CSV, GeoJSON,
WMS, WMTS, KML) that are auto-styled and persisted across sessions.

> Converted from a single-file HTML/AMD prototype (`arcgismap-draft-test2.html`,
> kept in git history) to a modular, type-checked, multi-developer codebase.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server (opens http://localhost:5173)
```

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run lint       # ESLint
npm run typecheck  # tsc, no emit
npm run format     # Prettier
```

## Architecture

The app separates **UI (React)** from **map logic (a plain TS class)** so the
two can evolve independently and be owned by different developers.

```
src/
  main.tsx                 # entry; mounts React, imports the ArcGIS dark theme
  App.tsx                  # shell layout + MapManager context provider
  index.css                # design tokens, reset, shared keyframes
  types.ts                 # shared domain types (LayerType, CursorCoords, …)

  store/
    mapStore.ts            # Zustand store: basemap, is3D, status, coords, layers

  arcgis/                  # framework-agnostic map layer
    MapManager.ts          # owns the Esri Map + View; build/rebuild, layers
    layerFactory.ts        # create each layer type + auto label/renderer/popup
    persistence.ts         # typed localStorage save/load
    mapContext.ts          # React context exposing the live MapManager

  components/              # one component (+ CSS module) per concern
    TopBar / Sidebar / BasemapPicker / ViewToggle /
    CoordinateDisplay / LayerList / AddLayerDialog /
    MapView / LoadingOverlay / MapTooltip

  data/
    basemaps.ts            # basemap option list
```

### Data flow

- React components read/write **UI state** in the Zustand store
  (`basemap`, `is3D`, …).
- `MapView` owns the `MapManager` instance and, via effects, pushes store
  changes into it (`setBasemap`, `buildView`).
- `MapManager` performs imperative ArcGIS work and reports results back through
  callbacks that update the store (`onStatus`, `onCoords`, `onLayersChange`).
- Imperative commands (add/remove/toggle layer) call `MapManager` directly
  through the `mapContext` ref.

This keeps `MapManager` free of React and the DOM, so it is unit-testable and
reusable if the UI framework ever changes.

### ArcGIS assets

Runtime assets (icons, fonts, web workers) are loaded from the version-matched
CDN via `esriConfig.assetsPath` in `MapManager.ts`, so they don't need to be
bundled or copied. Keep that version in sync with the `@arcgis/core` version in
`package.json`.

## Conventions for contributors

- **TypeScript strict mode** is on — no implicit `any`, unused locals error.
- **CSS Modules** per component; global design tokens live in `index.css`.
- Run `npm run lint` and `npm run typecheck` before pushing.
- New layer types: add to `LayerType` (`types.ts`), the `createLayer` switch
  (`layerFactory.ts`), and the dialog's `LAYER_TYPES` list.
