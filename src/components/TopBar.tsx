import { useMapStore } from '../store/mapStore';
import styles from './TopBar.module.css';

export function TopBar() {
  const status = useMapStore((s) => s.status);

  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>
        <div className={styles.logoDot} />
        ArcGIS Map Explorer
      </div>
      <div className={styles.spacer} />
      <div className={styles.statusPill}>
        <div className={`${styles.statusDot} ${styles[status.state]}`} />
        <span>{status.text}</span>
      </div>
    </div>
  );
}
