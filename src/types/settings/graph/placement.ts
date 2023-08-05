import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates, BoundingRect } from '@/types/layout';
import { DeepRequired, DeepRequiredAll } from '@/types/utils';

export type PlacementStrategy =
  | 'circle'
  | 'circles'
  | 'orbits'
  | 'random'
  | 'trees';

export type GraphPlacementSettings =
  | CircularPlacementSettings
  | OrbitsPlacementSettings
  | RandomPlacementSettings
  | TreesPlacementSettings;

export type GraphPlacementSettingsWithDefaults =
  | DeepRequiredAll<
      | CircularPlacementSettings
      | OrbitsPlacementSettings
      | TreesPlacementSettings
    >
  | RandomPlacementSettingsWithDefaults;

type SortablePlacementSettings = {
  sortComparator?: (key1: string, key2: string) => number;
  sortVertices?: boolean;
};

export type RandomMeshType = 'grid' | 'random' | 'triangular';

type SharedPlacementSettings = {
  minVertexSpacing?: number;
};

export type BoundRandomPlacementSettings = {
  containerHeight?: number;
  containerWidth?: number;
  mesh: 'random';
};

export type UnboundRandomPlacementSettings = {
  density?: number;
  mesh?: Exclude<RandomMeshType, 'random'>;
  minVertexSpacing?: number;
};

export type RandomPlacementSettings = {
  strategy: 'random';
} & (BoundRandomPlacementSettings | UnboundRandomPlacementSettings);

export type RandomPlacementSettingsWithDefaults = {
  strategy: 'random';
} & (
  | DeepRequired<BoundRandomPlacementSettings, ['mesh']>
  | DeepRequiredAll<UnboundRandomPlacementSettings>
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
  maxSectorAngle?: number; // in radians
  roots?: Array<string>;
  strategy: 'orbits';
  symmetrical?: boolean;
}) &
  OrbitsLayerSizingSettings;

export type CircularPlacementSettings = SharedPlacementSettings &
  SortablePlacementSettings & {
    strategy: 'circle' | 'circles';
  };

export type TreesPlacementSettings = SharedPlacementSettings & {
  roots?: Array<string>;
  strategy: 'trees';
};

export type PlacedVerticesPositions = Record<string, Vector>;
export type AnimatedPlacedVerticesPositions = Record<
  string,
  AnimatedVectorCoordinates
>;

export type GraphLayout = {
  boundingRect: BoundingRect;
  verticesPositions: PlacedVerticesPositions;
};
