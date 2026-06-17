import { useMapStore } from '../store/mapStore';
import styles from './MapTooltip.module.css';

export function MapTooltip() {
  const coords = useMapStore((s) => s.coords);
  const hasCoords = coords.lat !== null && coords.lon !== null;

  return (
    <div className={styles.tooltip}>
      {hasCoords ? (
        <>
          <div>
            <span className={styles.label}>lat</span>
            <span className={styles.val}>{coords.lat!.toFixed(5)}</span>
          </div>
          <div>
            <span className={styles.label}>lon</span>
            <span className={styles.val}>{coords.lon!.toFixed(5)}</span>
          </div>
          <div>
            <span className={styles.label}>zoom</span>
            <span className={styles.val}>
              {coords.zoom === null ? '—' : Math.round(coords.zoom)}
            </span>
          </div>
        </>
      ) : (
        <div>
          <span className={styles.label}>Hover map</span> to see coordinates
        </div>
      )}
    </div>
  );
}
