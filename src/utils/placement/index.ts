import { Graph } from '@/types/graphs';
import { GraphLayout, PlacementSettings } from '@/types/settings';

import { findGraphComponents } from '../algorithms/graphs';
import placeVerticesOnCircle from './strategies/circle.placement';
import placeVerticesOnCircles from './strategies/circles.placement';
import placeVerticesOnOrbits from './strategies/orbits.placement';
import placeVerticesRandomly from './strategies/random.placement';
import placeVerticesOnTree from './strategies/tree.placement';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  settings?: PlacementSettings<V, E>
): GraphLayout => {
  switch (settings?.strategy) {
    case 'circle':
      return placeVerticesOnCircle(graph.vertices, vertexRadius, settings);
    case 'circles':
      return placeVerticesOnCircles(
        findGraphComponents(graph.vertices),
        vertexRadius,
        settings
      );
    case 'orbits':
      return placeVerticesOnOrbits(
        findGraphComponents(graph.vertices),
        vertexRadius,
        graph.isDirected(),
        settings
      );
    case 'trees':
      return placeVerticesOnTree(graph, vertexRadius, settings); // TODO - change this to take graph components after adding undirected graphs support
    default:
    case 'random':
      return placeVerticesRandomly(graph.vertices, vertexRadius, settings);
  }
};
