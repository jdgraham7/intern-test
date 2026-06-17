import { createContext, useContext, type MutableRefObject } from 'react';
import type { MapManager } from './MapManager';

/** Holds a ref to the live MapManager so any component can issue commands. */
export const MapManagerContext =
  createContext<MutableRefObject<MapManager | null> | null>(null);

export function useMapManagerRef(): MutableRefObject<MapManager | null> {
  const ctx = useContext(MapManagerContext);
  if (!ctx) {
    throw new Error(
      'useMapManagerRef must be used within a MapManagerContext.Provider'
    );
  }
  return ctx;
}
