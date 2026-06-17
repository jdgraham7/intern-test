import { useMapStore } from '../store/mapStore';
import { BASEMAPS } from '../data/basemaps';
import styles from './Sidebar.module.css';

export function BasemapPicker() {
  const basemap = useMapStore((s) => s.basemap);
  const setBasemap = useMapStore((s) => s.setBasemap);

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Basemap</h3>
      <div className={styles.basemapGrid}>
        {BASEMAPS.map((b) => (
          <button
            key={b.id}
            className={`${styles.basemapBtn} ${
              basemap === b.id ? styles.active : ''
            }`}
            onClick={() => setBasemap(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </section>
  );
}
