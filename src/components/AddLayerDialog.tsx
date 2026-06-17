import { useState } from 'react';
import { useMapManagerRef } from '../arcgis/mapContext';
import type { LayerType } from '../types';
import styles from './AddLayerDialog.module.css';

interface Props {
  onClose: () => void;
}

const LAYER_TYPES: { value: LayerType; label: string }[] = [
  { value: 'feature', label: 'Feature Layer (URL)' },
  { value: 'tile', label: 'Tile Layer (URL)' },
  { value: 'csv', label: 'CSV Layer (URL)' },
  { value: 'geojson', label: 'GeoJSON Layer (URL)' },
  { value: 'wms', label: 'WMS Layer (URL)' },
  { value: 'wmts', label: 'WMTS Layer (URL)' },
  { value: 'kml', label: 'KML Layer (URL)' },
];

const SAMPLE_URL =
  'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World_Cities/FeatureServer/0';

export function AddLayerDialog({ onClose }: Props) {
  const managerRef = useMapManagerRef();
  const [type, setType] = useState<LayerType>('feature');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      await managerRef.current?.addLayer({
        url: trimmedUrl,
        title: name.trim() || 'Layer',
        type,
      });
      onClose();
    } catch {
      setSubmitting(false);
      window.alert('Could not load layer. Check the URL and try again.');
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Data Layer</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Layer Type</label>
          <select
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value as LayerType)}
          >
            {LAYER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Service URL</label>
          <input
            type="text"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="https://services.arcgis.com/…/FeatureServer/0"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(false);
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Display Name</label>
          <input
            type="text"
            className={styles.input}
            placeholder="My Layer"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.hint}>
          <strong>Quick test layer:</strong>
          <br />
          <code>{SAMPLE_URL}</code>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.addBtn}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Loading…' : 'Add Layer'}
          </button>
        </div>
      </div>
    </div>
  );
}
