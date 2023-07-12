import { GraphConnections } from '@/types/graphs';
import { GraphLayout, GraphPlacementSettings } from '@/types/settings';
import { findGraphComponents } from '@/utils/algorithms';

import placeVerticesOnCircle from './strategies/circle.placement';
import placeVerticesOnCircles from './strategies/circles.placement';
import placeVerticesRandomly from './strategies/random.placement';

export * from './shared';

export const placeVertices = (
  connections: GraphConnections,
  vertexRadius: number,
  settings?: GraphPlacementSettings
): GraphLayout => {
  'worklet';
  switch (settings?.strategy) {
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
    // case 'orbits':
    //   return placeVerticesOnOrbits(
    //     findGraphComponents(graph.vertices),
    //     vertexRadius,
    //     graph.isDirected(),
    //     settings
    //   );
    // case 'trees':
    //   return placeVerticesOnTrees(
    //     findGraphComponents(graph.vertices),
    //     vertexRadius,
    //     graph.isDirected(),
    //     settings
    //   );
    default:
    case 'random':
      return placeVerticesRandomly(
        Object.keys(connections),
        vertexRadius,
        settings
      );
  }
};
