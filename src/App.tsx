import { useRef } from 'react';
import type { MapManager } from './arcgis/MapManager';
import { MapManagerContext } from './arcgis/mapContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import styles from './App.module.css';

export default function App() {
  const managerRef = useRef<MapManager | null>(null);

  return (
    <MapManagerContext.Provider value={managerRef}>
      <TopBar />
      <div className={styles.layout}>
        <Sidebar />
        <MapView />
      </div>
    </MapManagerContext.Provider>
  );
}
