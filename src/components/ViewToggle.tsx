import { useMapStore } from '../store/mapStore';
import styles from './Sidebar.module.css';

export function ViewToggle() {
  const is3D = useMapStore((s) => s.is3D);
  const setIs3D = useMapStore((s) => s.setIs3D);
  const setStatus = useMapStore((s) => s.setStatus);

  const onChange = (checked: boolean) => {
    setStatus('loading', checked ? 'Building 3D scene…' : 'Loading 2D map…');
    setIs3D(checked);
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>View</h3>
      <div className={styles.toggleRow}>
        <span>3D Scene View</span>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={is3D}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className={styles.toggleTrack} />
        </label>
      </div>
    </section>
  );
}
