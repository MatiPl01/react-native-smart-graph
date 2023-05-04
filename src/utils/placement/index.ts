import { Graph } from '@/types/graphs';
import { GraphLayout, PlacementSettings } from '@/types/settings';

import placeVerticesCircular from './strategies/circular.placement';
import placeVerticesOnOrbits from './strategies/orbits.placement';
import placeVerticesRandomly from './strategies/random.placement';
import placeVerticesOnTree from './strategies/tree.placement';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  settings?: PlacementSettings<V, E>
): GraphLayout => {
  switch (settings?.strategy) {
    case 'circular':
      return placeVerticesCircular(graph, vertexRadius, settings);
    case 'orbits':
      return placeVerticesOnOrbits(graph, vertexRadius, settings);
    case 'tree':
      return placeVerticesOnTree(graph, vertexRadius, settings);
    default:
    case 'random':
      return placeVerticesRandomly(graph, vertexRadius, settings);
  }
};

// export const calcVertexPlacementPosition = (
//   vertexKey: string,
