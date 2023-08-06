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
import { DeepRequired, DeepRequire } from '@/types/utils';

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
export type AllRandomPlacementSettings =
  | DeepRequired<BoundRandomPlacementSettings, ['mesh']>
  | DeepRequire<UnboundRandomPlacementSettings>;

// Circle
export type AllCirclePlacementSettings = DeepRequire<CirclePlacementSettings>;

// Circles
export type AllCirclesPlacementSettings = DeepRequire<CirclesPlacementSettings>;

// Trees
export type AllTreesPlacementSettings = DeepRequire<TreesPlacementSettings>;

// Orbits
export type AllOrbitsPlacementSettings = DeepRequire<OrbitsPlacementSettings>;

/*
 * GRAPH PLACEMENT SETTINGS WITH ALL REQUIRED FIELDS
 */
export type AllGraphPlacementSettings =
  | AllRandomPlacementSettings
  | DeepRequire<Exclude<GraphPlacementSettings, RandomPlacementSettings>>;
