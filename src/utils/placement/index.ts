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
  vertexRadius: number,
  canvasDimensions: Dimensions,
  settings: AllGraphPlacementSettings,
  isGraphDirected = false
): GraphLayout => {
  'worklet';
  switch (settings.strategy) {
    case 'circle':
      return placeVerticesOnCircle(
        Object.keys(connections),
        vertexRadius,
        settings
      );
    case 'circles':
      return placeVerticesOnCircles(
        findGraphComponents(connections),
        vertexRadius,
        settings
      );
    case 'orbits':
      return placeVerticesOnOrbits(
        connections,
        vertexRadius,
        isGraphDirected,
        settings
      );
    case 'trees':
      return placeVerticesOnTrees(
        connections,
        vertexRadius,
        isGraphDirected,
        settings
      );
    default:
    case 'random':
      return placeVerticesRandomly(
        Object.keys(connections),
        vertexRadius,
        canvasDimensions,
        settings
      );
  }
};
