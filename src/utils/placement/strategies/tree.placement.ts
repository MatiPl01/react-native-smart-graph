import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphVertex, Graph } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreePlacementSettings
} from '@/types/settings';
import {
  findRootVertex,
  isGraphConnected,
  isGraphDirected
} from '@/utils/graphs';

// TODO - fix positioning (make relative tot the center pof tbe screen)
const placeVerticesOnTree = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  {
    minVertexSpacing = SHARED_PLACEMENT_SETTINGS.minVertexSpacing
  }: TreePlacementSettings
): GraphLayout => {
  // TODO - maybe add undirected graph support, there is a problem finding root vertex
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on tree for undirected graph');
  }

  const isConnected = isGraphConnected(graph);

  const { width, height } = getLayout(
    vertexRadius,
    minVertexSpacing,
    graph,
    isConnected
  );

  const orderGrid = getOrderGrid(graph);

  if (!isConnected) {
    placeOrphanedVertices(graph, orderGrid);
  }

  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;

  return {
    width,
    height,
    verticesPositions: graph.vertices.reduce((acc, { key }) => {
      if (orderGrid[key] === undefined) {
        return acc;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

const placeOrphanedVertices = <V, E>(
  graph: DirectedGraph<V, E>,
  orderGrid: Record<string, { row: number; col: number }>
) => {
  const orphanedVertices = graph.vertices.filter(
    v => orderGrid[v.key] === undefined
  );
  const orphanRow =
    Object.values(orderGrid).reduce((acc, { row }) => Math.max(acc, row), 0) +
    1;
  const maxTreeWidth = Object.values(orderGrid).reduce(
    (acc, { col }) => Math.max(acc, col),
    0
  );

  orphanedVertices.forEach((vertex, i) => {
    orderGrid[vertex.key] = {
      row: orphanRow,
      col:
        orphanedVertices.length > 1
          ? (i / (orphanedVertices.length - 1)) * maxTreeWidth
          : maxTreeWidth / 2
    };
  });
};

const getOrderGrid = <V, E>(
  graph: DirectedGraph<V, E>
): Record<string, { row: number; col: number }> => {
  const rootVertex = findRootVertex(graph) as DirectedGraphVertex<V, E>;
  if (!rootVertex) {
    return {};
  }

  const verticesPositions = {} as Record<string, { row: number; col: number }>;
  const treeWidth = placeVertices(graph, verticesPositions, rootVertex);
  verticesPositions[rootVertex.key] = { row: 0, col: treeWidth / 2 - 0.5 };

  return verticesPositions;
};

const placeVertices = <V, E>(
  graph: DirectedGraph<V, E>,
  verticesPositions: Record<string, { row: number; col: number }>,
  vertex: DirectedGraphVertex<V, E>,
  currentDepth = 0,
  currentColumn = 0
): number => {
  if (vertex.outDegree === 0) {
    return 1;
  }

  let subtreeWidth = 0;
  vertex.outEdges.forEach(edge => {
    const oldSubtreeWidth = subtreeWidth;
    const childSubtreeWidth = placeVertices(
      graph,
      verticesPositions,
      edge.target,
      currentDepth + 1,
      currentColumn + subtreeWidth
    );
    subtreeWidth += childSubtreeWidth;

    verticesPositions[edge.target.key] = {
      row: currentDepth + 1,
      col: currentColumn + oldSubtreeWidth + childSubtreeWidth / 2 - 0.5
    };
  });
  return subtreeWidth;
};

const getLayout = <V, E>(
  vertexRadius: number,
  minVertexSpacing: number,
  graph: DirectedGraph<V, E>,
  isConnected: boolean
) => {
  const rootVertex = findRootVertex(graph) as DirectedGraphVertex<V, E>;
  const dimensions = getMaxTreeDimensions(rootVertex);

  if (!isConnected) {
    dimensions.depth += 1;
  }

  const padding = 2 * vertexRadius;
  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;
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
