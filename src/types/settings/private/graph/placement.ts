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
import { DeepRequired, DeepRequiredAll } from '@/types/utils';

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
  | DeepRequiredAll<UnboundRandomPlacementSettings>;

// Circle
export type AllCirclePlacementSettings =
  DeepRequiredAll<CirclePlacementSettings>;

// Circles
export type AllCirclesPlacementSettings =
  DeepRequiredAll<CirclesPlacementSettings>;

// Trees
export type AllTreesPlacementSettings = DeepRequiredAll<TreesPlacementSettings>;

// Orbits
export type AllOrbitsPlacementSettings =
  DeepRequiredAll<OrbitsPlacementSettings>;

/*
 * GRAPH PLACEMENT SETTINGS WITH ALL REQUIRED FIELDS
 */
export type AllGraphPlacementSettings =
  | AllRandomPlacementSettings
  | DeepRequiredAll<Exclude<GraphPlacementSettings, RandomPlacementSettings>>;
