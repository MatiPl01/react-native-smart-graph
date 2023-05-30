import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { DirectedGraphVertex, Vertex } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreesPlacementSettings
} from '@/types/settings';
import { findRootVertex } from '@/utils/graphs/models';

import { arrangeGraphComponents, calcContainerDimensions } from '../shared';

const placeVerticesOnTree = <V, E>(
  graphComponents: Array<Array<DirectedGraphVertex<V, E>>>,
  vertexRadius: number,
  isGraphDirected: boolean,
  settings: TreesPlacementSettings
): GraphLayout => {
  const componentsLayouts: Array<GraphLayout> = [];
  const rootVertexKeys = new Set(settings.roots);

  for (const component of graphComponents) {
    // Find the root vertex of the component
    const rootVertex = findRootVertex(
      component,
      rootVertexKeys,
      isGraphDirected
    );

    // place vertices on the grid
    const orderGrid = getOrderGrid(rootVertex);

    // place vertices in the layout
    const placedVerticesPositions = placeVertices(
      orderGrid,
      vertexRadius,
      settings
    );

    // calculate container dimensions
    const containerDimensions = calcContainerDimensions(
      placedVerticesPositions,
      vertexRadius
    );

    componentsLayouts.push({
      ...containerDimensions,
      verticesPositions: placedVerticesPositions
    });
  }

  return arrangeGraphComponents(componentsLayouts);
};

const getOrderGrid = <V, E>(
  rootVertex: Vertex<V, E>
): Record<string, { row: number; col: number }> => {
  const verticesOrder = {} as Record<string, { row: number; col: number }>;
  const treeWidth = placeVerticesOnGrid(verticesOrder, rootVertex);
  verticesOrder[rootVertex.key] = {
    row: 0,
    col: treeWidth / 2 - 0.5
  };

  return verticesOrder;
};

const placeVerticesOnGrid = <V, E>(
  verticesOrder: Record<string, { row: number; col: number }>,
  vertex: Vertex<V, E>,
  currentColumn = 0,
  currentDepth = 0
): number => {
  const unusedVertexNeighbors = vertex.neighbors.filter(
    neighbor => !verticesOrder[neighbor.key]
  );

  if (unusedVertexNeighbors.length === 0) {
    return 1;
  }

  let subtreeWidth = 0;
  unusedVertexNeighbors.forEach(neighbor => {
    const oldSubtreeWidth = subtreeWidth;
    const childSubtreeWidth = placeVerticesOnGrid(
      verticesOrder,
      neighbor,
      currentColumn + subtreeWidth,
      currentDepth + 1
    );
    subtreeWidth += childSubtreeWidth;

    verticesOrder[neighbor.key] = {
      row: currentDepth + 1,
      col: currentColumn + oldSubtreeWidth + childSubtreeWidth / 2 - 0.5
    };
  });
  return subtreeWidth;
};

const placeVertices = (
  orderGrid: Record<string, { row: number; col: number }>,
  vertexRadius: number,
  settings: TreesPlacementSettings
): PlacedVerticesPositions => {
  // determine the minimum distance between vertices
  const minVertexCenterDistance =
    2 * vertexRadius +
    (settings.minVertexSpacing || SHARED_PLACEMENT_SETTINGS.minVertexSpacing);

  // determine the width and height of the grid
  const { numRows, numCols } = Object.values(orderGrid).reduce(
    (acc, { row, col }) => ({
      numRows: Math.max(acc.numRows, row + 1),
      numCols: Math.max(acc.numCols, col + 1)
    }),
    { numRows: 0, numCols: 0 }
  );

  // calculate the width and height of the grid as well as the padding
  const padding = 2 * vertexRadius;
  const width = padding + numCols * minVertexCenterDistance;
  const height = padding + numRows * minVertexCenterDistance;

  // calculate the positions of the vertices based on the grid
  return Object.entries(orderGrid).reduce(
    (acc, [key, { row, col }]) => ({
      ...acc,
      [key]: {
        x: vertexRadius + col * minVertexCenterDistance - width / 2,
        y: vertexRadius + row * minVertexCenterDistance - height / 2
      }
    }),
    {} as PlacedVerticesPositions
  );
};
export default placeVerticesOnTree;
