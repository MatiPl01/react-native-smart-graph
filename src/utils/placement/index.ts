import { Dimensions } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import { AllGraphPlacementSettings, GraphLayout } from '@/types/settings';
import { findGraphComponents } from '@/utils/algorithms';

import placeVerticesOnCircle from './strategies/circle.placement';
import placeVerticesOnCircles from './strategies/circles.placement';
import placeVerticesOnOrbits from './strategies/orbits.placement';
import placeVerticesRandomly from './strategies/random.placement';
import placeVerticesOnTrees from './strategies/trees.placement';

export * from './shared';

export const placeVertices = (
  connections: GraphConnections,
  canvasDimensions: Dimensions,
  settings: AllGraphPlacementSettings,
  isGraphDirected = false
): GraphLayout => {
  'worklet';
  switch (settings.strategy) {
    case 'circle':
      return placeVerticesOnCircle(Object.keys(connections), settings);
    case 'circles':
      return placeVerticesOnCircles(findGraphComponents(connections), settings);
    case 'orbits':
      return placeVerticesOnOrbits(connections, isGraphDirected, settings);
    case 'trees':
      return placeVerticesOnTrees(connections, isGraphDirected, settings);
    default:
    case 'random':
      return placeVerticesRandomly(
        Object.keys(connections),
        canvasDimensions,
        settings
      );
  }
};
