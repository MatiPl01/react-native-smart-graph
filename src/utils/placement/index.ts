import { Graph } from '@/types/graphs';
import { GraphLayout, PlacementSettings } from '@/types/placement';

import placeVerticesCircular from './strategies/circular.placement';
import placeVerticesOnOrbits from './strategies/orbits.placement';
import placeVerticesRandomly from './strategies/random.placement';
import placeVerticesOnTree from './strategies/tree.placement';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  placementSettings?: PlacementSettings<V, E>
): GraphLayout => {
  switch (placementSettings?.strategy) {
    case 'circular':
      return placeVerticesCircular(graph, placementSettings);
    case 'orbits':
      return placeVerticesOnOrbits(graph, placementSettings);
    case 'tree':
      return placeVerticesOnTree(graph, placementSettings);
    default:
    case 'random':
      return placeVerticesRandomly(graph, placementSettings);
  }
};
