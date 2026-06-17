import { useEffect, useRef } from 'react';
import { MapManager } from '../arcgis/MapManager';
import { useMapManagerRef } from '../arcgis/mapContext';
import { useMapStore } from '../store/mapStore';
import { LoadingOverlay } from './LoadingOverlay';
import { MapTooltip } from './MapTooltip';
import styles from './MapView.module.css';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useMapManagerRef();
  const restored = useRef(false);

  const basemap = useMapStore((s) => s.basemap);
  const is3D = useMapStore((s) => s.is3D);

  // Construct the manager once, wiring its callbacks to the store.
  useEffect(() => {
    if (!containerRef.current) return;
    const store = useMapStore.getState();
    const manager = new MapManager(containerRef.current, store.basemap, {
      onStatus: (state, text) => useMapStore.getState().setStatus(state, text),
      onCoords: (coords) => useMapStore.getState().setCoords(coords),
      onLayersChange: (layers) => useMapStore.getState().setLayers(layers),
      onReady: () => useMapStore.getState().setMapReady(true),
    });
    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
      restored.current = false;
      useMapStore.getState().setMapReady(false);
    };
  }, [managerRef]);

  // Build / rebuild the view whenever the 2D⇄3D mode changes.
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;
    manager.buildView(is3D);
    if (!restored.current) {
      restored.current = true;
      void manager.restoreSavedLayers();
    }
  }, [is3D, managerRef]);

  // Apply basemap changes to the live map.
  useEffect(() => {
    managerRef.current?.setBasemap(basemap);
  }, [basemap, managerRef]);

  return (
    <div className={styles.mapContainer}>
      <div ref={containerRef} className={styles.viewDiv} />
      <LoadingOverlay />
      <MapTooltip />
    </div>
  );
}
