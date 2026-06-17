import { BasemapPicker } from './BasemapPicker';
import { ViewToggle } from './ViewToggle';
import { CoordinateDisplay } from './CoordinateDisplay';
import { LayerList } from './LayerList';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <BasemapPicker />
      <ViewToggle />
      <CoordinateDisplay />
      <LayerList />
    </aside>
  );
}
