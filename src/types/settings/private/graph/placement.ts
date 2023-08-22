import {
  AnimatedVectorCoordinates,
  BoundingRect,
  Vector
} from '@/types/layout';
import {
  BoundRandomPlacementSettings,
  CirclePlacementSettings,
  CirclesPlacementSettings,
  GraphPlacementSettings,
  OrbitsPlacementSettings,
  RandomPlacementSettings,
  TreesPlacementSettings,
  UnboundRandomPlacementSettings
} from '@/types/settings/public';
import {
  DeepRequired,
  PartialBy,
  Sharedify,
  SharedifyWithout,
  Unsharedify
} from '@/types/utils';

export type PlacedVerticesPositions = Record<string, Vector>;

export type AnimatedPlacedVerticesPositions = Record<
  string,
  AnimatedVectorCoordinates
>;

export type GraphLayout = {
  boundingRect: BoundingRect;
  verticesPositions: PlacedVerticesPositions;
};

/*
 * PLACEMENT SETTINGS WITH ALL REQUIRED FIELDS
 */
// Random
export type AllBoundRandomPlacementSettings = PartialBy<
  DeepRequired<Unsharedify<BoundRandomPlacementSettings>>,
  'containerHeight' | 'containerWidth'
>;

export type AllUnboundRandomPlacementSettings = DeepRequired<
  Unsharedify<UnboundRandomPlacementSettings>
>;

export type AllRandomPlacementSettings =
  | AllBoundRandomPlacementSettings
  | AllUnboundRandomPlacementSettings;

// Circle
export type AllCirclePlacementSettings = DeepRequired<
  Unsharedify<CirclePlacementSettings>
>;

// Circles
export type AllCirclesPlacementSettings = DeepRequired<
  Unsharedify<CirclesPlacementSettings>
>;

// Trees
export type AllTreesPlacementSettings = DeepRequired<
  Unsharedify<TreesPlacementSettings>
>;

// Orbits
export type AllOrbitsPlacementSettings = DeepRequired<
  Unsharedify<OrbitsPlacementSettings>
>;

/*
 * GRAPH PLACEMENT SETTINGS WITH ALL REQUIRED FIELDS
 */
export type AllGraphPlacementSettings =
  | AllRandomPlacementSettings
  | DeepRequired<Exclude<GraphPlacementSettings, RandomPlacementSettings>>;

/*
 * INTERNAL GRAPH PLACEMENT SETTINGS
 */
export type InternalBoundRandomPlacementSettings =
  Sharedify<AllBoundRandomPlacementSettings>;

export type InternalUnboundRandomPlacementSettings =
  Sharedify<AllUnboundRandomPlacementSettings>;

export type InternalRandomPlacementSettings =
  | InternalBoundRandomPlacementSettings
  | InternalUnboundRandomPlacementSettings;

export type InternalCirclePlacementSettings = SharedifyWithout<
  AllCirclePlacementSettings,
  'sortComparator'
>;

export type InternalCirclesPlacementSettings = SharedifyWithout<
  AllCirclesPlacementSettings,
  'sortComparator'
>;

export type InternalTreesPlacementSettings =
  Sharedify<AllTreesPlacementSettings>;

export type InternalOrbitsPlacementSettings = SharedifyWithout<
  AllOrbitsPlacementSettings,
  'getLayerRadius'
>;

export type InternalGraphPlacementSettings =
  | InternalCirclePlacementSettings
  | InternalCirclesPlacementSettings
  | InternalOrbitsPlacementSettings
  | InternalRandomPlacementSettings
  | InternalTreesPlacementSettings;
