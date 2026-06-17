import { useMapStore } from '../store/mapStore';
import styles from './Sidebar.module.css';

const fmt = (n: number | null, digits = 5) =>
  n === null ? '—' : n.toFixed(digits);

export function CoordinateDisplay() {
  const coords = useMapStore((s) => s.coords);

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Cursor Coordinates</h3>
      <div className={styles.coordDisplay}>
        <div>
          <span>{fmt(coords.lat)}</span> lat
        </div>
        <div>
          <span>{fmt(coords.lon)}</span> lon
        </div>
        <div>
          Zoom <span>{coords.zoom === null ? '—' : Math.round(coords.zoom)}</span>
        </div>
        <div>
          Scale 1:
          <span>
            {coords.scale === null
              ? '—'
              : Math.round(coords.scale).toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
}
