/** Shared domain types for the map explorer. */

/** Layer types the user can add from the dialog. */
export type LayerType =
  | 'feature'
  | 'tile'
  | 'csv'
  | 'geojson'
  | 'wms'
  | 'wmts'
  | 'kml';

/** A layer configuration as entered by the user / persisted to storage. */
export interface LayerConfig {
  url: string;
  title: string;
  type: LayerType;
}

/** Lightweight view of a live layer for rendering the sidebar list. */
export interface LayerListItem {
  /** Stable Esri layer id, used as React key and for lookups. */
  id: string;
  title: string;
  visible: boolean;
}

/** Status pill state in the top bar. */
export type StatusState = 'loading' | 'ready' | 'error';

/** Live cursor coordinate readout. */
export interface CursorCoords {
  lat: number | null;
  lon: number | null;
  zoom: number | null;
  scale: number | null;
}

/** Available basemaps shown in the sidebar picker. */
export interface BasemapOption {
  id: string;
  label: string;
}
