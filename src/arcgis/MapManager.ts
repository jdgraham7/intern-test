import esriConfig from '@arcgis/core/config';
import EsriMap from '@arcgis/core/Map';
import Basemap from '@arcgis/core/Basemap';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import Zoom from '@arcgis/core/widgets/Zoom';
import Home from '@arcgis/core/widgets/Home';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Compass from '@arcgis/core/widgets/Compass';
import Search from '@arcgis/core/widgets/Search';
import Legend from '@arcgis/core/widgets/Legend';
import type Layer from '@arcgis/core/layers/Layer';

import { createLayer, configureFeatureLayer } from './layerFactory';
import { saveLayers, loadLayers } from './persistence';
import type {
  CursorCoords,
  LayerConfig,
  LayerListItem,
  StatusState,
} from '../types';

// Load runtime assets (icons, workers, fonts) from the version-matched CDN so
// we don't have to bundle or copy the ~ hundreds of asset files locally.
esriConfig.assetsPath = 'https://js.arcgis.com/4.31/@arcgis/core/assets';

const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283]; // contiguous US
const DEFAULT_ZOOM = 4;

export interface MapManagerCallbacks {
  onStatus(state: StatusState, text: string): void;
  onCoords(coords: CursorCoords): void;
  onLayersChange(layers: LayerListItem[]): void;
  onReady(): void;
}

/**
 * Owns the Esri Map and its active View. UI-framework agnostic: it reports
 * state back through callbacks rather than touching the DOM or the store.
 */
export class MapManager {
  private readonly map: EsriMap;
  private view: MapView | SceneView | null = null;
  private readonly container: HTMLDivElement;
  private readonly cb: MapManagerCallbacks;
  private is3D = false;
  /** Layer id → original config, kept in sync for persistence. */
  private readonly configs = new Map<string, LayerConfig>();

  constructor(
    container: HTMLDivElement,
    basemap: string,
    callbacks: MapManagerCallbacks
  ) {
    this.container = container;
    this.cb = callbacks;
    this.map = new EsriMap({ basemap: Basemap.fromId(basemap) });
  }

  /** Build (or rebuild) the 2D MapView or 3D SceneView. */
  buildView(is3D: boolean): void {
    this.is3D = is3D;
    this.view?.destroy();

    const view = is3D
      ? new SceneView({
          container: this.container,
          map: this.map,
          camera: {
            position: { x: DEFAULT_CENTER[0], y: 20, z: 8_000_000 },
            tilt: 30,
          },
        })
      : new MapView({
          container: this.container,
          map: this.map,
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
        });

    view.ui.remove('zoom');
    view.ui.add(new Zoom({ view }), 'top-left');
    view.ui.add(new Home({ view }), 'top-left');
    view.ui.add(new Compass({ view }), 'top-left');
    if (!is3D) {
      // ScaleBar is 2D-only; guarded by !is3D, so the view is a MapView here.
      view.ui.add(
        new ScaleBar({ view: view as MapView, unit: 'dual' }),
        'bottom-left'
      );
    }

    view.on('pointer-move', (evt) => {
      const pt = view.toMap({ x: evt.x, y: evt.y });
      if (!pt) return;
      this.cb.onCoords({
        lat: pt.latitude,
        lon: pt.longitude,
        zoom: view.zoom,
        scale: view.scale,
      });
    });

    view.when(
      () => {
        view.ui.add(new Search({ view, popupEnabled: false }), 'top-right');
        view.ui.add(new Legend({ view, style: 'classic' }), 'bottom-left');
        this.cb.onReady();
        this.cb.onStatus('ready', 'Map ready');
      },
      (err: unknown) => {
        this.cb.onStatus('error', 'Error loading map');
        console.error(err);
      }
    );

    this.view = view;
  }

  setBasemap(id: string): void {
    this.map.basemap = Basemap.fromId(id);
  }

  /** Add a layer from config: load, configure, persist, zoom to extent. */
  async addLayer(config: LayerConfig): Promise<void> {
    this.cb.onStatus('loading', 'Loading layer…');
    try {
      const layer = await createLayer(config);
      this.map.add(layer);
      await layer.when();

      await configureFeatureLayer(layer, this.is3D);

      this.configs.set(layer.id, config);
      this.cb.onStatus('ready', 'Layer loaded');
      this.syncLayers();
      this.persist();

      if (this.view && layer.fullExtent) {
        this.view.goTo(layer.fullExtent).catch(() => {});
      }
    } catch (err) {
      this.cb.onStatus('error', 'Layer error');
      console.error('Layer load error:', err);
      throw err;
    }
  }

  removeLayer(id: string): void {
    const layer = this.map.findLayerById(id);
    if (!layer) return;
    this.map.remove(layer);
    this.configs.delete(id);
    this.syncLayers();
    this.persist();
  }

  setLayerVisible(id: string, visible: boolean): void {
    const layer = this.map.findLayerById(id);
    if (!layer) return;
    layer.visible = visible;
    this.syncLayers();
  }

  /** Restore layers persisted from a previous session. */
  async restoreSavedLayers(): Promise<void> {
    for (const config of loadLayers()) {
      // Sequential so the status pill and zoom-to behaviour stay coherent.
      await this.addLayer(config).catch(() => {});
    }
  }

  destroy(): void {
    this.view?.destroy();
    this.view = null;
  }

  private toListItem(layer: Layer): LayerListItem {
    return { id: layer.id, title: layer.title ?? '', visible: layer.visible };
  }

  private syncLayers(): void {
    this.cb.onLayersChange(this.map.layers.map((l) => this.toListItem(l)).toArray());
  }

  private persist(): void {
    const configs: LayerConfig[] = [];
    this.map.layers.forEach((l) => {
      const config = this.configs.get(l.id);
      if (config) configs.push(config);
    });
    saveLayers(configs);
  }
}
