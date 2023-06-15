import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { Vertex } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreesPlacementSettings
} from '@/types/settings';
import { findRootVertex } from '@/utils/graphs/models';
import {
  arrangeGraphComponents,
  calcContainerBoundingRect
} from '@/utils/placement/shared';

const placeVerticesOnTrees = <V, E>(
  graphComponents: Array<Array<Vertex<V, E>>>,
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
    // Place vertices on the grid
    const arrangedVertices = arrangeVertices(rootVertex);
    // Place vertices in the layout
    const minVertexSpacing =
      settings.minVertexSpacing ?? SHARED_PLACEMENT_SETTINGS.minVertexSpacing;
    const verticesPositions = placeVertices(
      arrangedVertices,
      minVertexSpacing,
      vertexRadius
    );
    // Calculate container dimensions
    componentsLayouts.push({
      verticesPositions,
      boundingRect: calcContainerBoundingRect(
        verticesPositions,
        minVertexSpacing,
        vertexRadius
      )
    });
  }

  return arrangeGraphComponents(componentsLayouts, vertexRadius);
};

const arrangeVertices = <V, E>(
  rootVertex: Vertex<V, E>
): Record<string, { row: number; col: number }> => {
  const arrangedVertices: Record<string, { row: number; col: number }> = {};
  const treeWidth = arrangeVerticesRecur(arrangedVertices, rootVertex);

  arrangedVertices[rootVertex.key] = {
    row: 0,
    col: treeWidth / 2 - 0.5
  };

  return arrangedVertices;
};

const arrangeVerticesRecur = <V, E>(
  arrangedVertices: Record<string, { row: number; col: number }>,
  vertex: Vertex<V, E>,
  visitedVertices: Set<string> = new Set(),
  currentColumn = 0,
  currentDepth = 0
): number => {
  visitedVertices.add(vertex.key);
  const unusedVertexNeighbors: Array<Vertex<V, E>> = [];
  const alreadyCheckedNeighbors = new Set<string>();

  vertex.neighbors.forEach(neighbor => {
    if (
      !alreadyCheckedNeighbors.has(neighbor.key) &&
      !visitedVertices.has(neighbor.key)
    ) {
      alreadyCheckedNeighbors.add(neighbor.key);
      unusedVertexNeighbors.push(neighbor);
    }
  });

  if (unusedVertexNeighbors.length === 0) {
    return 1;
  }

  let subtreeWidth = 0;
  unusedVertexNeighbors.forEach(neighbor => {
    const oldSubtreeWidth = subtreeWidth;
    const childSubtreeWidth = arrangeVerticesRecur(
      arrangedVertices,
      neighbor,
      visitedVertices,
      currentColumn + subtreeWidth,
      currentDepth + 1
    );
    subtreeWidth += childSubtreeWidth;

    arrangedVertices[neighbor.key] = {
      row: currentDepth + 1,
      col: currentColumn + oldSubtreeWidth + childSubtreeWidth / 2 - 0.5
    };
  });

  return subtreeWidth;
};

const placeVertices = (
  arrangedVertices: Record<string, { row: number; col: number }>,
  minVertexSpacing: number,
  vertexRadius: number
): PlacedVerticesPositions => {
  // determine the minimum distance between vertices
  const padding = 2 * vertexRadius;
  const minVertexCenterDistance = padding + minVertexSpacing;

  // determine the width and height of the grid
  const { numRows, numCols } = Object.values(arrangedVertices).reduce(
    (acc, { row, col }) => ({
      numRows: Math.max(acc.numRows, row + 1),
      numCols: Math.max(acc.numCols, col + 1)
    }),
    { numRows: 0, numCols: 0 }
  );

  // calculate the width and height of the grid as well as the padding
  const width = padding + (numCols - 1) * minVertexCenterDistance;
  const height = padding + (numRows - 1) * minVertexCenterDistance;

  // calculate the positions of the vertices based on the grid
  return Object.entries(arrangedVertices).reduce(
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

export default placeVerticesOnTrees;
