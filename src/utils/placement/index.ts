import { Graph } from '@/types/graphs';
import { RelativeVerticesOrder } from '@/types/layout';
import {
  GraphLayout,
  PlacedVerticesPositions,
  PlacementSettings
} from '@/types/settings';

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

export const orderVertices = (
  axis: 'x' | 'y',
  positions: PlacedVerticesPositions
): RelativeVerticesOrder => {
  const order: RelativeVerticesOrder = {};
  const sortedKeys = Object.keys(positions).sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return positions[a]![axis] - positions[b]![axis];
  });

  sortedKeys.forEach((key, index) => {
    order[key] = {
      prev: sortedKeys[index - 1],
      next: sortedKeys[index + 1],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      position: positions[key]![axis]
    };
  });

  return order;
};
