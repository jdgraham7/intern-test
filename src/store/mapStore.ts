import { create } from 'zustand';
import type {
  CursorCoords,
  LayerListItem,
  StatusState,
} from '../types';

interface MapState {
  /** Active basemap id. */
  basemap: string;
  /** Whether the 3D SceneView is active (vs 2D MapView). */
  is3D: boolean;
  /** Whether the map runtime has finished its first load. */
  mapReady: boolean;
  /** Top-bar status pill. */
  status: { state: StatusState; text: string };
  /** Live cursor coordinates. */
  coords: CursorCoords;
  /** Layers currently on the map (mirror of the Esri layer collection). */
  layers: LayerListItem[];

  setBasemap: (id: string) => void;
  setIs3D: (is3D: boolean) => void;
  setMapReady: (ready: boolean) => void;
  setStatus: (state: StatusState, text: string) => void;
  setCoords: (coords: CursorCoords) => void;
  setLayers: (layers: LayerListItem[]) => void;
}

const EMPTY_COORDS: CursorCoords = {
  lat: null,
  lon: null,
  zoom: null,
  scale: null,
};

export const useMapStore = create<MapState>((set) => ({
  basemap: 'dark-gray-vector',
  is3D: false,
  mapReady: false,
  status: { state: 'loading', text: 'Initializing…' },
  coords: EMPTY_COORDS,
  layers: [],

  setBasemap: (id) => set({ basemap: id }),
  setIs3D: (is3D) => set({ is3D }),
  setMapReady: (mapReady) => set({ mapReady }),
  setStatus: (state, text) => set({ status: { state, text } }),
  setCoords: (coords) => set({ coords }),
  setLayers: (layers) => set({ layers }),
}));
