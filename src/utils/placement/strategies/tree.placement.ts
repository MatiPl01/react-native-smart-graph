/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphVertex, Graph } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreePlacementSettings
} from '@/types/settings';
import {
  findRootVertices,
  getBalancingOrphanedNeighbors,
  getOrphanedVertices,
  isGraphAcyclic,
  isGraphDirected
} from '@/utils/graphs';

const placeVerticesOnTree = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  {
    minVertexSpacing = SHARED_PLACEMENT_SETTINGS.minVertexSpacing
  }: TreePlacementSettings
): GraphLayout => {
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on tree for undirected graph');
  }

  if (!isGraphAcyclic(graph)) {
    throw new Error(
      'Cannot place vertices on tree for graph that contains cycles'
    );
  }

  const rootVertices = findRootVertices(graph);

  if (rootVertices.length === 0) {
    throw new Error(
      'Cannot place vertices on tree for graph without root vertex'
    );
  }

  const orphanedVertices = getOrphanedVertices(graph.vertices);
  const orphanedNeighbors = getBalancingOrphanedNeighbors(
    rootVertices,
    orphanedVertices
  );

  let orderGrid = {} as Record<string, { row: number; col: number }>;
  let columnShift = 0;
  for (const rootVertex of rootVertices) {
    orderGrid = {
      ...orderGrid,
      ...getOrderGrid(rootVertex, graph, orphanedNeighbors, columnShift)
    };
    const treeWidth = (orderGrid[rootVertex.key]!.col - columnShift + 0.5) * 2;
    columnShift += treeWidth;
  }

  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;

  const { numRows, numCols } = Object.values(orderGrid).reduce(
    (acc, { row, col }) => ({
      numRows: Math.max(acc.numRows, row + 1),
      numCols: Math.max(acc.numCols, col + 1)
    }),
    { numRows: 0, numCols: 0 }
  );
  const padding = 2 * vertexRadius;
  const width = padding + numCols * minVertexCenterDistance;
  const height = padding + numRows * minVertexCenterDistance;

  return {
    width,
    height,
    verticesPositions: Object.entries(orderGrid).reduce(
      (acc, [key, { row, col }]) => ({
        ...acc,
        [key]: {
          x: vertexRadius + col * minVertexCenterDistance - width / 2,
          y: vertexRadius + row * minVertexCenterDistance - height / 2
        }
      }),
      {} as PlacedVerticesPositions
    )
  };
};

const getOrderGrid = <V, E>(
  rootVertex: DirectedGraphVertex<V, E>,
  graph: DirectedGraph<V, E>,
  orphanedNeighbors: Record<string, Array<DirectedGraphVertex<V, E>>>,
  columnShift: number
): Record<string, { row: number; col: number }> => {
  const verticesOrder = {} as Record<string, { row: number; col: number }>;
  const treeWidth = placeVertices(
    graph,
    verticesOrder,
    orphanedNeighbors,
    rootVertex,
    columnShift
  );
  verticesOrder[rootVertex.key] = {
    row: 0,
    col: columnShift + treeWidth / 2 - 0.5
  };

  return verticesOrder;
};

const placeVertices = <V, E>(
  graph: DirectedGraph<V, E>,
  verticesOrder: Record<string, { row: number; col: number }>,
  orphanedNeighbors: Record<string, Array<DirectedGraphVertex<V, E>>>,
  vertex: DirectedGraphVertex<V, E>,
  currentColumn: number,
  currentDepth = 0
): number => {
  const vertexNeighbors = vertex.outEdges
    .map(edge => edge.target)
    .concat(orphanedNeighbors[vertex.key] || []);

  if (vertexNeighbors.length === 0) {
    return 1;
  }

  let subtreeWidth = 0;
  vertexNeighbors.forEach(neighbor => {
    const oldSubtreeWidth = subtreeWidth;
    const childSubtreeWidth = placeVertices(
      graph,
      verticesOrder,
      orphanedNeighbors,
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

export default placeVerticesOnTree;
