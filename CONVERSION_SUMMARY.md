# Conversion Summary

**Date:** 2026-06-17
**Branch:** `convert-to-react-vite`

## Goal

Take the single-file ArcGIS HTML/JS prototype and turn it into a robust,
modular application that a team of three developers can build on and
collaborate in without stepping on each other.

## Starting point

- One self-contained file: `arcgismap-draft-test2.html` (~925 lines of mixed
  HTML, CSS, and JavaScript).
- Loaded the ArcGIS SDK 4.30 from the CDN via the legacy AMD `require()` loader.
- No build tooling, package manager, types, linting, or tests.
- Features: basemap switcher, 2D/3D toggle, live cursor coordinates, and an
  "add data layer" dialog with auto-styling and `localStorage` persistence.

## Framework decision

Chose **React + TypeScript + Vite** with the `@arcgis/core` ES-modules package
and **Zustand** for shared state.

Why this stack:
- Largest hiring/knowledge pool → easiest onboarding for two more developers.
- TypeScript turns whole classes of the prototype's bugs into compile errors.
- Vite + `@arcgis/core` is Esri's officially documented modern setup
  (tree-shaking, real version pinning, IDE autocomplete).
- Component split lets each developer own files and avoid merge conflicts.

## What we built

A modular React app that preserves every feature of the prototype:

```
src/
  main.tsx, App.tsx, index.css, types.ts
  store/mapStore.ts          # Zustand UI state
  arcgis/                    # framework-agnostic map layer
    MapManager.ts            # owns the Esri Map + View
    layerFactory.ts          # builds each layer type + auto label/renderer/popup
    persistence.ts           # typed localStorage save/load
    mapContext.ts            # React context exposing the live MapManager
  components/                # one component + CSS module per concern
  data/basemaps.ts
```

**Key architectural decision:** map logic lives in a plain TypeScript class
(`MapManager`) with no React or DOM dependencies. The UI drives it through a
context ref and receives updates via callbacks. This seam keeps the map engine
testable and independent of the UI framework.

## Tooling added

- Strict TypeScript (`tsc` project references)
- ESLint (flat config) + Prettier
- npm scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `format`

## Bugs fixed during the migration

| Issue in prototype | Resolution |
| --- | --- |
| `saveLayers` / `loadSavedLayers` defined twice; outer copies referenced out-of-scope `map` (dead, broken) | Single typed `persistence.ts` module |
| Dialog offered geojson/wms/wmts/kml but only feature/tile/csv worked (silent fallback to FeatureLayer) | `layerFactory.ts` supports all seven types |
| Persistence sniffed `declaredClass` strings to guess layer type | Stores explicit type, validates on load |
| Layer titles injected via `innerHTML` (XSS risk) | React escapes text by default |
| Duplicate `setStatus("ready", ...)` call | Removed |

## Verification

- `npm run typecheck` — passes
- `npm run lint` — passes (0 warnings)
- `npm run build` — passes
- Preview server returns HTTP 200

Not yet verified: live browser render of map tiles (requires ArcGIS CDN
access). Run `npm run dev` to confirm visually.

## Follow-ups / open items

- **Bundle size:** main chunk ~3.3 MB (964 KB gzipped) — normal for the ArcGIS
  SDK; consider `manualChunks` if it becomes a concern.
- **Asset version sync:** `esriConfig.assetsPath` in `MapManager.ts` is pinned
  to the `4.31` CDN; keep it matched to `@arcgis/core` in `package.json`.
- **Tests:** no test setup yet — a Vitest suite around `MapManager` and
  `persistence` would give the incoming developers a safety net.
- **PR:** the working account lacks push access to `jdgraham7/intern-test`;
  opening a PR requires forking to the contributor's account first.
