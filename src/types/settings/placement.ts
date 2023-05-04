import { Vector } from '@shopify/react-native-skia';

import { Vertex } from '../graphs';

export type PlacementStrategy = 'random' | 'circular' | 'orbits' | 'tree';

export type DirectedGraphPlacementSettings<V, E> =
  | RandomPlacementSettings
  | CircularPlacementSettings<V, E>
  | OrbitsPlacementSettings
  | TreePlacementSettings;

export type UndirectedGraphPlacementSettings<V, E> =
  | RandomPlacementSettings
  | CircularPlacementSettings<V, E>;

export type PlacementSettings<V, E> =
  | DirectedGraphPlacementSettings<V, E>
  | UndirectedGraphPlacementSettings<V, E>;

type SharedPlacementSettings = {
  minVertexSpacing?: number;
};

type SortablePlacementSettings<V, E> = {
  sortVertices?: boolean;
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
};

export type RandomLayoutType = 'grid' | 'honeycomb' | 'random';

export type RandomPlacementSettings = {
  strategy: 'random';
} & (
  | {
      layoutType: Exclude<RandomLayoutType, 'random'>;
      density?: number;
      minVertexSpacing?: number;
    }
  | {
      layoutType: 'random';
      containerWidth: number;
      containerHeight: number;
    }
);

export type OrbitsLayerSizing =
  | 'auto'
  | 'equal'
  | 'quad-increasing'
  | 'non-decreasing'
  | 'custom';

export type GetLayerRadiusFunction = (props: {
  layerIndex: number;
  layersCount: number;
  previousLayerRadius: number;
}) => number;

export type OrbitsSharedLayerSizingSettings = {
  layerSizing?: Exclude<OrbitsLayerSizing, 'custom'>;
};

export type OrbitsCustomLayerSizingSettings = {
  layerSizing: 'custom';
  getLayerRadius: GetLayerRadiusFunction;
};

export type OrbitsLayerSizingSettings =
  | OrbitsSharedLayerSizingSettings
  | OrbitsCustomLayerSizingSettings;

// TODO - maybe add orbits vertices sorting
export type OrbitsPlacementSettings = (SharedPlacementSettings & {
  strategy: 'orbits';
}) &
  OrbitsLayerSizingSettings;

export type CircularPlacementSettings<V, E> = SharedPlacementSettings &
  SortablePlacementSettings<V, E> & {
    strategy: 'circular';
  };

export type TreePlacementSettings = SharedPlacementSettings & {
  strategy: 'tree';
};

export type PlacedVerticesPositions = Record<string, Vector>;

export type GraphLayout = {
  width: number;
  height: number;
  verticesPositions: PlacedVerticesPositions;
};
