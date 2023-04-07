// TODO - improve docs later
import { Vertex } from '@/types/graphs';
import { PlacedVerticesPositions, PlacementProps } from '@/types/placement';

import { findRootVertex, isGraphATree, isGraphDirected } from '../graphs.utils';
import { getContainerLayout } from './shared';

/**
 * The graph must be a tree!
 * Places vertices in a circular fashion. The root vertex is placed in the center of the circle.
 *
 * @param graph
 * @param containerWidth
 * @param containerHeight
 * @returns
 */
const placeVerticesOnOrbits = <V, E>(
  props: PlacementProps<V, E>
): PlacedVerticesPositions => {
  const { graph } = props;

  // TODO - maybe add undirected graph support
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }
  if (!isGraphATree(graph)) {
    throw new Error('Cannot place vertices on rings for non-tree graph');
  }

  const verticesPositionCoordinates: Record<
    string,
    { layer: number; angle: number }
  > = {};

  const rootVertex = findRootVertex(graph) as Vertex<V, E>;

  placeChildrenOnRingSection(
    rootVertex,
    0,
    0,
    2 * Math.PI,
    verticesPositionCoordinates
  );

  const totalLayers = Math.max(
    ...Object.values(verticesPositionCoordinates).map(({ layer }) => layer)
  );

  const { center, radius: maxRadius } = getContainerLayout(props);

  return Object.entries(verticesPositionCoordinates).reduce(
    (acc, [key, { layer, angle }]) => {
      const r = (layer / totalLayers) * maxRadius;
      acc[key] = {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      };
      return acc;
    },
    {} as PlacedVerticesPositions
  );
};

const placeChildrenOnRingSection = <V, E>(
  parent: Vertex<V, E>,
  parentLayer: number,
  parentAngle: number,
  sectionAngle: number,
  verticesPositionCoordinates: Record<string, { layer: number; angle: number }>
) => {
  verticesPositionCoordinates[parent.key] = {
    layer: parentLayer,
    angle: parentAngle
  };

  parent.neighbors.forEach((child, i) => {
    placeChildrenOnRingSection(
      child,
      parentLayer + 1,
      parentAngle -
        sectionAngle / 2 +
        (sectionAngle / parent.neighbors.length) * (i + 0.5),
      sectionAngle / parent.neighbors.length,
      verticesPositionCoordinates
    );
  });
};

export default placeVerticesOnOrbits;
