import { Vector } from '@shopify/react-native-skia';

import { Vertex } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';

export type PlacementStrategy =
  | 'circle'
  | 'circles'
  | 'orbits'
  | 'random'
  | 'trees';

export type DirectedGraphPlacementSettings<V, E> =
  | CircularPlacementSettings<V, E>
  | OrbitsPlacementSettings
  | RandomPlacementSettings
  | TreesPlacementSettings;

export type UndirectedGraphPlacementSettings<V, E> =
  | CircularPlacementSettings<V, E>
  | OrbitsPlacementSettings
  | RandomPlacementSettings;

export type PlacementSettings<V, E> =
  | DirectedGraphPlacementSettings<V, E>
  | UndirectedGraphPlacementSettings<V, E>;

type SharedPlacementSettings = {
  minVertexSpacing?: number;
};

type SortablePlacementSettings<V, E> = {
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
  sortVertices?: boolean;
};

export type RandomLayoutType = 'grid' | 'random' | 'triangles';

export type RandomPlacementSettings = {
  strategy: 'random';
} & (
  | {
      containerHeight: number;
      containerWidth: number;
      layoutType: 'random';
    }
  | {
      density?: number;
      layoutType: Exclude<RandomLayoutType, 'random'>;
      minVertexSpacing?: number;
    }
);

export type OrbitsLayerSizing =
  | 'auto'
  | 'custom'
  | 'equal'
  | 'non-decreasing'
  | 'quad-increasing';

export type GetLayerRadiusFunction = (props: {
  layerIndex: number;
  layersCount: number;
  previousLayerRadius: number;
}) => number;

export type OrbitsSharedLayerSizingSettings = {
  layerSizing?: Exclude<OrbitsLayerSizing, 'custom'>;
};

export type OrbitsCustomLayerSizingSettings = {
  getLayerRadius: GetLayerRadiusFunction;
  layerSizing: 'custom';
};

export type OrbitsLayerSizingSettings =
  | OrbitsCustomLayerSizingSettings
  | OrbitsSharedLayerSizingSettings;

// TODO - maybe add orbits vertices sorting
export type OrbitsPlacementSettings = (SharedPlacementSettings & {
  roots?: Array<string>;
  strategy: 'orbits';
}) &
  OrbitsLayerSizingSettings;

export type CircularPlacementSettings<V, E> = SharedPlacementSettings &
  SortablePlacementSettings<V, E> & {
    strategy: 'circle' | 'circles';
  };

export type TreesPlacementSettings = SharedPlacementSettings & {
  roots?: Array<string>;
  strategy: 'trees';
};

export type PlacedVerticesPositions = Record<string, Vector>;

export type GraphLayout = {
  boundingRect: BoundingRect;
  verticesPositions: PlacedVerticesPositions;
};
