import type { BasemapOption } from '../types';

/** Basemaps offered in the sidebar picker (Esri basemap ids). */
export const BASEMAPS: BasemapOption[] = [
  { id: 'dark-gray-vector', label: 'Dark Gray' },
  { id: 'streets-vector', label: 'Streets' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'topo-vector', label: 'Topo' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'openstreetmap', label: 'OpenStreetMap' },
];
