import { useState } from 'react';
import { useMapStore } from '../store/mapStore';
import { useMapManagerRef } from '../arcgis/mapContext';
import { AddLayerDialog } from './AddLayerDialog';
import styles from './Sidebar.module.css';

export function LayerList() {
  const layers = useMapStore((s) => s.layers);
  const managerRef = useMapManagerRef();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className={`${styles.section} ${styles.layersSection}`}>
      <h3 className={styles.heading}>Data Layers</h3>

      {layers.length === 0 ? (
        <div className={styles.layerListEmpty}>
          No layers added yet.
          <br />
          Use the button below to start exploring data.
        </div>
      ) : (
        layers.map((layer, i) => (
          <div key={layer.id} className={styles.layerItem}>
            <div className={styles.layerItemLeft}>
              <span className={styles.layerSwatch} />
              <span className={styles.layerTitle} title={layer.title}>
                {layer.title || `Layer ${i + 1}`}
              </span>
            </div>
            <div className={styles.layerItemActions}>
              <button
                className={`${styles.iconBtn} ${
                  layer.visible ? '' : styles.dimmed
                }`}
                title="Toggle visibility"
                onClick={() =>
                  managerRef.current?.setLayerVisible(layer.id, !layer.visible)
                }
              >
                👁
              </button>
              <button
                className={styles.iconBtn}
                title="Remove layer"
                onClick={() => managerRef.current?.removeLayer(layer.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      <button className={styles.addLayerBtn} onClick={() => setDialogOpen(true)}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Data Layer
      </button>

      {dialogOpen && <AddLayerDialog onClose={() => setDialogOpen(false)} />}
    </section>
  );
}
