import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates, BoundingRect } from '@/types/layout';
import {
  BoundRandomPlacementSettings,
  GraphPlacementSettings,
  RandomPlacementSettings,
  UnboundRandomPlacementSettings
} from '@/types/settings/public/graph/placement';
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
 * RANDOM PLACEMENT
 */
export type AllRandomPlacementSettings =
  | DeepRequired<BoundRandomPlacementSettings, ['mesh']>
  | DeepRequiredAll<UnboundRandomPlacementSettings>;

/*
 * GRAPH PLACEMENT SETTINGS
 */
export type AllGraphPlacementSettings =
  | AllRandomPlacementSettings
  | DeepRequiredAll<Exclude<GraphPlacementSettings, RandomPlacementSettings>>;
