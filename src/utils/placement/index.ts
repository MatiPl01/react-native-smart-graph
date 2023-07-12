import { GraphConnections } from '@/types/graphs';
import { GraphLayout, GraphPlacementSettings } from '@/types/settings';

import placeVerticesRandomly from './strategies/random.placement';

export * from './shared';

export const placeVertices = <V, E>(
  connections: GraphConnections,
  vertexRadius: number,
  settings?: GraphPlacementSettings<V, E>
): GraphLayout => {
  'worklet';
  switch (settings?.strategy) {
    case 'circle':
    //   return placeVerticesOnCircle(graph.vertices, vertexRadius, settings);
    // case 'circles':
    //   return placeVerticesOnCircles(
    //     findGraphComponents(graph.vertices),
    //     vertexRadius,
    //     settings
    //   );
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
      return placeVerticesRandomly(connections, vertexRadius, settings);
  }
};
