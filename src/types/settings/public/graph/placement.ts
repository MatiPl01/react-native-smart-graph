/* eslint-disable import/no-unused-modules */
type SharedPlacementSettings = {
  minVertexSpacing?: number;
};

type SortablePlacementSettings = {
  sortComparator?: (key1: string, key2: string) => number;
  sortVertices?: boolean;
};

/*
 * RANDOM PLACEMENT
 */
export type RandomMeshType = 'grid' | 'random' | 'triangular';

export type BoundRandomPlacementSettings = {
  containerHeight?: number;
  containerWidth?: number;
  mesh: 'random';
  strategy: 'random';
};

export type UnboundRandomPlacementSettings = SharedPlacementSettings & {
  density?: number;
  mesh?: Exclude<RandomMeshType, 'random'>;
  strategy: 'random';
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
  strategy: 'circle';
};

// Circles
export type CirclesPlacementSettings = SharedCircularPlacementSettings & {
  strategy: 'circles';
};

/*
 * ROOTS PLACEMENT (trees, orbits)
 */
type SharedRootsPlacementSettings = SharedPlacementSettings & {
  roots?: Array<string>;
};

// Trees
export type TreesPlacementSettings = SharedRootsPlacementSettings & {
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
  layerSizing: 'custom';
};

export type OrbitsPlacementSettings = SharedRootsPlacementSettings &
  (
    | {
        layerSizing?: Exclude<OrbitsLayerSizing, 'custom'>;
      }
    | OrbitsCustomLayerSizingSettings
  ) & {
    maxSectorAngle?: number;
    roots?: Array<string>;
    strategy: 'orbits';
    symmetrical?: boolean;
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
