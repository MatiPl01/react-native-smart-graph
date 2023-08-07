import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates, BoundingRect } from '@/types/layout';
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
import { DeepRequired, PartialBy } from '@/types/utils';

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
  DeepRequired<BoundRandomPlacementSettings>,
  'containerHeight' | 'containerWidth'
>;

export type AllUnboundRandomPlacementSettings =
  DeepRequired<UnboundRandomPlacementSettings>;

export type AllRandomPlacementSettings =
  | AllBoundRandomPlacementSettings
  | AllUnboundRandomPlacementSettings;

// Circle
export type AllCirclePlacementSettings = DeepRequired<CirclePlacementSettings>;

// Circles
export type AllCirclesPlacementSettings =
  DeepRequired<CirclesPlacementSettings>;

// Trees
export type AllTreesPlacementSettings = DeepRequired<TreesPlacementSettings>;

// Orbits
export type AllOrbitsPlacementSettings = DeepRequired<OrbitsPlacementSettings>;

/*
 * GRAPH PLACEMENT SETTINGS WITH ALL REQUIRED FIELDS
 */
export type AllGraphPlacementSettings =
  | AllRandomPlacementSettings
  | DeepRequired<Exclude<GraphPlacementSettings, RandomPlacementSettings>>;
