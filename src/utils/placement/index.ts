import { Graph } from '@/types/graphs';
import { GraphLayout, PlacementSettings } from '@/types/settings';

import placeVerticesCircular from './strategies/circular.placement';
import placeVerticesOnOrbits from './strategies/orbits.placement';
import placeVerticesRandomly from './strategies/random.placement';
import placeVerticesOnTree from './strategies/tree.placement';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  placementSettings?: PlacementSettings<V, E>
): GraphLayout => {
  switch (placementSettings?.strategy) {
    case 'circular':
      return placeVerticesCircular(graph, vertexRadius, placementSettings);
    case 'orbits':
      return placeVerticesOnOrbits(graph, vertexRadius, placementSettings);
    case 'tree':
      return placeVerticesOnTree(graph, vertexRadius, placementSettings);
    default:
    case 'random':
      return placeVerticesRandomly(graph, vertexRadius, placementSettings);
  }
};
