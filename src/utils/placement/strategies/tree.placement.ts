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
  const orphanedNeighbours = getBalancingOrphanedNeighbors(
    rootVertices,
    orphanedVertices
  );

  let orderGrid = {} as Record<string, { row: number; col: number }>;
  let columnShift = 0;
  for (const rootVertex of rootVertices) {
    orderGrid = {
      ...orderGrid,
      ...getOrderGrid(rootVertex, graph, orphanedNeighbours, columnShift)
    };
    const treeWidth = (orderGrid[rootVertex.key]!.col - columnShift + 0.5) * 2;
    columnShift += treeWidth;
  }

  const { width, height } = getLayout(vertexRadius, minVertexSpacing, graph);

  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;

  return {
    width,
    height,
    verticesPositions: graph.vertices.reduce((acc, { key }) => {
      if (orderGrid[key] === undefined) {
        return acc;
      }
      const gridPosition = orderGrid[key]!;

      acc[key] = {
        x:
          -(width / 2) +
          vertexRadius +
          gridPosition.col * minVertexCenterDistance,
        y:
          -(height / 2) +
          vertexRadius +
          gridPosition.row * minVertexCenterDistance
      };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
};

const getOrderGrid = <V, E>(
  rootVertex: DirectedGraphVertex<V, E>,
  graph: DirectedGraph<V, E>,
  orphanedNeighbours: Record<string, Array<DirectedGraphVertex<V, E>>>,
  columnShift: number
): Record<string, { row: number; col: number }> => {
  const verticesPositions = {} as Record<string, { row: number; col: number }>;
  const treeWidth = placeVertices(
    graph,
    verticesPositions,
    orphanedNeighbours,
    rootVertex,
    columnShift
  );
  verticesPositions[rootVertex.key] = {
    row: 0,
    col: columnShift + treeWidth / 2 - 0.5
  };

  return verticesPositions;
};

const placeVertices = <V, E>(
  graph: DirectedGraph<V, E>,
  verticesPositions: Record<string, { row: number; col: number }>,
  orphanedNeighbours: Record<string, Array<DirectedGraphVertex<V, E>>>,
  vertex: DirectedGraphVertex<V, E>,
  currentColumn: number,
  currentDepth = 0
): number => {
  const vertexNeighbours = vertex.outEdges
    .map(edge => edge.target)
    .concat(orphanedNeighbours[vertex.key] || []);

  if (vertexNeighbours.length === 0) {
    return 1;
  }

  let subtreeWidth = 0;
  vertexNeighbours.forEach(neighbour => {
    const oldSubtreeWidth = subtreeWidth;
    const childSubtreeWidth = placeVertices(
      graph,
      verticesPositions,
      orphanedNeighbours,
      neighbour,
      currentColumn + subtreeWidth,
      currentDepth + 1
    );
    subtreeWidth += childSubtreeWidth;

    verticesPositions[neighbour.key] = {
      row: currentDepth + 1,
      col: currentColumn + oldSubtreeWidth + childSubtreeWidth / 2 - 0.5
    };
  });
  return subtreeWidth;
};

const getLayout = <V, E>(
  vertexRadius: number,
  minVertexSpacing: number,
  graph: DirectedGraph<V, E>
) => {
  const padding = 2 * vertexRadius;
  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;
  const rootVertices = findRootVertices(graph);
  const dimensions = { width: 0, depth: 0 };

  for (const rootVertex of rootVertices) {
    const treeDimensions = getMaxTreeDimensions(rootVertex);
    dimensions.width += treeDimensions.width;
    dimensions.depth = Math.max(dimensions.depth, treeDimensions.depth);
  }

  const containerWidth =
    padding + (dimensions.width - 1) * minVertexCenterDistance;
  const containerHeight =
    padding + (dimensions.depth - 1) * minVertexCenterDistance;

  return {
    width: containerWidth,
    height: containerHeight
  };
};

const getMaxTreeDimensions = <V, E>(
  vertex: DirectedGraphVertex<V, E>
): { width: number; depth: number } => {
  if (vertex.outDegree === 0) {
    return { width: 1, depth: 1 };
  }

  let maxSubtreeWidth = 0;
  let maxSubtreeDepth = 0;
  vertex.outEdges.forEach(edge => {
    const { width, depth } = getMaxTreeDimensions(edge.target);
    maxSubtreeWidth += width;
    maxSubtreeDepth = Math.max(maxSubtreeDepth, depth);
  });

  return {
    width: maxSubtreeWidth,
    depth: maxSubtreeDepth + 1
  };
};

export default placeVerticesOnTree;
