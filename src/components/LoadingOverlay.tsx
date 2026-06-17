import { useMapStore } from '../store/mapStore';
import styles from './LoadingOverlay.module.css';

export function LoadingOverlay() {
  const mapReady = useMapStore((s) => s.mapReady);
  const status = useMapStore((s) => s.status);

  return (
    <div className={`${styles.overlay} ${mapReady ? styles.hidden : ''}`}>
      <div className={styles.spinner} />
      <p>{status.state === 'error' ? status.text : 'Loading ArcGIS runtime…'}</p>
    </div>
  );
}
