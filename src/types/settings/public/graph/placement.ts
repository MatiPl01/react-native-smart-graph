import { Animatable } from '@/types/utils';

type SortablePlacementSettings = {
  sortComparator?: (key1: string, key2: string) => number;
  sortVertices?: Animatable<boolean>;
};

/*
 * RANDOM PLACEMENT
 */
export type RandomMeshType = 'grid' | 'random' | 'triangular';

export type BoundRandomPlacementSettings = {
  containerHeight?: Animatable<number>;
  containerWidth?: Animatable<number>;
  mesh: 'random';
  strategy: 'random';
};

export type UnboundRandomPlacementSettings = {
  density?: Animatable<number>;
  mesh?: Exclude<RandomMeshType, 'random'>;
  minVertexDistance?: Animatable<number>;
  strategy: 'random';
};

export type RandomPlacementSettings =
  | BoundRandomPlacementSettings
  | UnboundRandomPlacementSettings;

/*
 * CIRCULAR PLACEMENT (circle, circles)
 */
type SharedCircularPlacementSettings = SortablePlacementSettings & {
  minVertexDistance?: Animatable<number>;
};

// Circle
export type CirclePlacementSettings = SharedCircularPlacementSettings & {
  strategy: 'circle';
};

// Circles
export type CirclesPlacementSettings = SharedCircularPlacementSettings & {
  strategy: 'circles';
};

/*
 * TREE-LIKE PLACEMENT (trees, orbits)
 */
// Trees
export type TreesPlacementSettings = {
  minColumnDistance?: Animatable<number>;
  minRowDistance?: Animatable<number>;
  roots?: Animatable<Array<string>>;
  strategy: 'trees';
};

// Orbits
export type LayerRadiusGetter = (props: {
  layerIndex: number;
  layersCount: number;
  previousLayerRadius: number;
}) => number;

export type OrbitsLayerSizing =
  | 'auto'
  | 'custom'
  | 'equal'
  | 'non-decreasing'
  | 'quad-increasing';

type OrbitsCustomLayerSizingSettings = {
  getLayerRadius: LayerRadiusGetter;
  layerSizing: Animatable<'custom'>;
};

export type OrbitsPlacementSettings = (
  | {
      layerSizing?: Animatable<Exclude<OrbitsLayerSizing, 'custom'>>;
    }
  | OrbitsCustomLayerSizingSettings
) & {
  maxSectorAngle?: Animatable<number>;
  minVertexDistance?: Animatable<number>;
  roots?: Animatable<Array<string>>;
  strategy: 'orbits';
  symmetrical?: Animatable<boolean>;
};

/*
 * GRAPH PLACEMENT SETTINGS
 */

export type GraphPlacementSettings =
  | CirclePlacementSettings
  | CirclesPlacementSettings
  | OrbitsPlacementSettings
  | RandomPlacementSettings
  | TreesPlacementSettings;

export type PlacementStrategy = GraphPlacementSettings['strategy'];
