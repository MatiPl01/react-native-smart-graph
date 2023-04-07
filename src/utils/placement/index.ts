import { Graph } from '@/types/graphs';
import { PlacedVerticesPositions, PlacementSettings } from '@/types/placement';

import placeVerticesCircular from './circular.placement';
import placeVerticesOnOrbits from './orbits.placement';
import placeVerticesRandomly from './random.placement';
import placeVerticesOnTree from './tree.placement';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  containerWidth: number,
  containerHeight: number,
  vertexRadius: number,
  placementSettings?: PlacementSettings<V, E>
): PlacedVerticesPositions => {
  const { strategy, ...settings } =
    placementSettings || ({} as PlacementSettings<V, E>);
  const placementProps = {
    graph,
    containerWidth,
    containerHeight,
    vertexRadius
  };

  switch (strategy) {
    case 'circular':
      return placeVerticesCircular(placementProps, settings);
    case 'orbits':
      return placeVerticesOnOrbits(placementProps);
    case 'tree':
      return placeVerticesOnTree(placementProps, settings);
    default:
    case 'random':
      return placeVerticesRandomly(placementProps);
  }
};
