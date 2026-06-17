import type { LayerConfig, LayerType } from '../types';

const STORAGE_KEY = 'savedLayers';

const VALID_TYPES: readonly LayerType[] = [
  'feature',
  'tile',
  'csv',
  'geojson',
  'wms',
  'wmts',
  'kml',
];

function isLayerConfig(value: unknown): value is LayerConfig {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.url === 'string' &&
    typeof v.title === 'string' &&
    typeof v.type === 'string' &&
    VALID_TYPES.includes(v.type as LayerType)
  );
}

/** Persist the user's layer list to localStorage. */
export function saveLayers(layers: LayerConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
  } catch (err) {
    console.warn('Failed to save layers:', err);
  }
}

/** Load and validate the persisted layer list. Returns [] on any problem. */
export function loadLayers(): LayerConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLayerConfig);
  } catch (err) {
    console.warn('Failed to load saved layers:', err);
    return [];
  }
}
