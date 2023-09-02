import { Sharedifyable } from '@/types/utils';

type SortablePlacementSettings = {
  sortComparator?: (key1: string, key2: string) => number;
  sortVertices?: Sharedifyable<boolean>;
};

/*
 * RANDOM PLACEMENT
 */
export type RandomMeshType = 'grid' | 'random' | 'triangular';

export type BoundRandomPlacementSettings = {
  containerHeight?: Sharedifyable<number>;
  containerWidth?: Sharedifyable<number>;
  mesh: 'random';
  strategy: 'random';
};

export type UnboundRandomPlacementSettings = {
  density?: Sharedifyable<number>;
  mesh?: Exclude<RandomMeshType, 'random'>;
  minVertexDistance?: Sharedifyable<number>;
  strategy: 'random';
};

export type RandomPlacementSettings =
  | BoundRandomPlacementSettings
  | UnboundRandomPlacementSettings;

/*
 * CIRCULAR PLACEMENT (circle, circles)
 */
type SharedCircularPlacementSettings = SortablePlacementSettings & {
  minVertexDistance?: Sharedifyable<number>;
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
  minColumnDistance?: Sharedifyable<number>;
  minRowDistance?: Sharedifyable<number>;
  roots?: Sharedifyable<Array<string>>;
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
  layerSizing: Sharedifyable<'custom'>;
};

export type OrbitsPlacementSettings = (
  | {
      layerSizing?: Sharedifyable<Exclude<OrbitsLayerSizing, 'custom'>>;
    }
  | OrbitsCustomLayerSizingSettings
) & {
  maxSectorAngle?: Sharedifyable<number>;
  minVertexDistance?: Sharedifyable<number>;
  roots?: Sharedifyable<Array<string>>;
  strategy: 'orbits';
  symmetrical?: Sharedifyable<boolean>;
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
