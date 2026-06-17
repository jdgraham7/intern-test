import type Layer from '@arcgis/core/layers/Layer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import LabelSymbol3D from '@arcgis/core/symbols/LabelSymbol3D';
import TextSymbol3DLayer from '@arcgis/core/symbols/TextSymbol3DLayer';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import FieldsContent from '@arcgis/core/popup/content/FieldsContent';
import FieldInfo from '@arcgis/core/popup/FieldInfo';
import type Symbol from '@arcgis/core/symbols/Symbol';
import type Field from '@arcgis/core/layers/support/Field';

import type { LayerConfig } from '../types';

/** Layers that expose attribute fields and querying (config target). */
type FeatureLikeLayer =
  | __esri.FeatureLayer
  | __esri.CSVLayer
  | __esri.GeoJSONLayer;

/**
 * Instantiate the correct Esri layer class for a config. Layer modules are
 * dynamically imported so only the types actually used are bundled.
 */
export async function createLayer(config: LayerConfig): Promise<Layer> {
  const { url, title } = config;
  switch (config.type) {
    case 'feature': {
      const { default: FeatureLayer } = await import(
        '@arcgis/core/layers/FeatureLayer'
      );
      return new FeatureLayer({ url, title });
    }
    case 'tile': {
      const { default: TileLayer } = await import(
        '@arcgis/core/layers/TileLayer'
      );
      return new TileLayer({ url, title });
    }
    case 'csv': {
      const { default: CSVLayer } = await import(
        '@arcgis/core/layers/CSVLayer'
      );
      return new CSVLayer({ url, title });
    }
    case 'geojson': {
      const { default: GeoJSONLayer } = await import(
        '@arcgis/core/layers/GeoJSONLayer'
      );
      return new GeoJSONLayer({ url, title });
    }
    case 'wms': {
      const { default: WMSLayer } = await import(
        '@arcgis/core/layers/WMSLayer'
      );
      return new WMSLayer({ url, title });
    }
    case 'wmts': {
      const { default: WMTSLayer } = await import(
        '@arcgis/core/layers/WMTSLayer'
      );
      return new WMTSLayer({ url, title });
    }
    case 'kml': {
      const { default: KMLLayer } = await import(
        '@arcgis/core/layers/KMLLayer'
      );
      return new KMLLayer({ url, title });
    }
  }
}

function isFeatureLike(layer: Layer): layer is FeatureLikeLayer {
  return 'fields' in layer && 'queryFeatures' in layer;
}

function firstLabelField(fields: Field[]): Field | undefined {
  return fields.find(
    (f) =>
      f.type === 'string' &&
      !['objectid', 'globalid'].includes(f.name.toLowerCase())
  );
}

function randomColor(): number[] {
  const channel = () => Math.floor(Math.random() * 200) + 30;
  return [channel(), channel(), channel(), 0.8];
}

function symbolForGeometry(
  geometryType: string,
  color: number[]
): Symbol {
  if (geometryType === 'point' || geometryType === 'multipoint') {
    return new SimpleMarkerSymbol({
      color,
      size: 8,
      outline: { color: 'white', width: 0.5 },
    });
  }
  if (geometryType === 'polyline') {
    return new SimpleLineSymbol({ color, width: 2 });
  }
  return new SimpleFillSymbol({
    color,
    outline: { color: 'white', width: 0.5 },
  });
}

function applyLabels(layer: FeatureLikeLayer, field: Field, is3D: boolean) {
  const symbol = is3D
    ? new LabelSymbol3D({
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: 'white' },
            size: 12,
            halo: { color: 'black', size: 2 },
          }),
        ],
      })
    : new TextSymbol({
        color: 'white',
        haloColor: 'black',
        haloSize: 2,
        font: { family: 'Arial', size: 12, weight: 'bold' },
      });

  layer.labelingInfo = [
    new LabelClass({
      labelExpressionInfo: { expression: `$feature.${field.name}` },
      symbol,
    }),
  ];
}

async function applyRenderer(layer: FeatureLikeLayer, field: Field) {
  const result = await layer.queryFeatures();
  const values = [
    ...new Set(result.features.map((f) => f.attributes[field.name])),
  ];

  layer.renderer = new UniqueValueRenderer({
    field: field.name,
    uniqueValueInfos: values.map((value) => ({
      value,
      label: String(value),
      symbol: symbolForGeometry(layer.geometryType, randomColor()),
    })),
  });
}

function applyPopup(layer: FeatureLikeLayer) {
  const fieldInfos = layer.fields
    .filter((f) => f.type !== 'oid')
    .map(
      (f) =>
        new FieldInfo({
          fieldName: f.name,
          label: f.alias ?? f.name,
          visible: true,
        })
    );

  layer.popupTemplate = new PopupTemplate({
    title: layer.title || 'Information',
    content: [new FieldsContent({ fieldInfos })],
  });
}

/**
 * Apply auto-generated labels, a unique-value renderer, and a popup template
 * to a freshly loaded layer. No-ops for layer types without attribute fields
 * (tile / WMS / WMTS / KML). Each step is best-effort and isolated.
 */
export async function configureFeatureLayer(layer: Layer, is3D: boolean) {
  if (!isFeatureLike(layer)) return;

  const field = firstLabelField(layer.fields);
  if (!field) return;

  try {
    applyLabels(layer, field, is3D);
  } catch (err) {
    console.warn('Labeling skipped:', err);
  }

  try {
    await applyRenderer(layer, field);
  } catch (err) {
    console.warn('Renderer skipped:', err);
  }

  try {
    applyPopup(layer);
  } catch (err) {
    console.warn('Popup template skipped:', err);
  }
}
