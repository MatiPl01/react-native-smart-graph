import { Sharedifyable } from '@/types/utils';

/* eslint-disable import/no-unused-modules */
type SharedPlacementSettings = {
  minVertexSpacing?: Sharedifyable<number>;
};

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
  mesh: Sharedifyable<'random'>;
  strategy: Sharedifyable<'random'>;
};

export type UnboundRandomPlacementSettings = SharedPlacementSettings & {
  density?: Sharedifyable<number>;
  mesh?: Sharedifyable<Exclude<RandomMeshType, 'random'>>;
  strategy: Sharedifyable<'random'>;
};

export type RandomPlacementSettings =
  | BoundRandomPlacementSettings
  | UnboundRandomPlacementSettings;

/*
 * CIRCULAR PLACEMENT (circle, circles)
 */
type SharedCircularPlacementSettings = SortablePlacementSettings &
  SharedPlacementSettings;

// Circle
export type CirclePlacementSettings = SharedCircularPlacementSettings & {
  strategy: Sharedifyable<'circle'>;
};

// Circles
export type CirclesPlacementSettings = SharedCircularPlacementSettings & {
  strategy: Sharedifyable<'circles'>;
};

/*
 * ROOTS PLACEMENT (trees, orbits)
 */
type SharedRootsPlacementSettings = SharedPlacementSettings & {
  roots?: Sharedifyable<Array<string>>;
};

// Trees
export type TreesPlacementSettings = SharedRootsPlacementSettings & {
  strategy: Sharedifyable<'trees'>;
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

export type OrbitsPlacementSettings = SharedRootsPlacementSettings &
  (
    | {
        layerSizing?: Sharedifyable<Exclude<OrbitsLayerSizing, 'custom'>>;
      }
    | OrbitsCustomLayerSizingSettings
  ) & {
    maxSectorAngle?: Sharedifyable<number>;
    strategy: Sharedifyable<'orbits'>;
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
