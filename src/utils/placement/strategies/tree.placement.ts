import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphVertex, Graph } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreePlacementSettings
} from '@/types/placement';

import { findRootVertex, isGraphATree, isGraphDirected } from '../../graphs';
import { DEFAULTS } from '../constants';
import { defaultSortComparator } from '../shared';

const placeVerticesOnTree = <V, E>(
  graph: Graph<V, E>,
  {
    sortComparator = defaultSortComparator,
    sortChildren = false,
    vertexRadius = DEFAULTS.vertexRadius,
    minVertexDistance = DEFAULTS.minVertexDistance
  }: TreePlacementSettings<V, E>
): GraphLayout => {
  const vertices = sortChildren
    ? graph.vertices.sort(sortComparator)
    : graph.vertices;

  // TODO - maybe add undirected graph support, there is a problem finding root vertex
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on tree for undirected graph');
  }
  if (!isGraphATree(graph)) {
    throw new Error('Cannot place vertices on tree for non-tree graph');
  }

  const { width, height } = getLayout(vertexRadius, minVertexDistance, graph);

  const orderGrid = getOrderGrid(graph);

  return {
    width,
    height,
    verticesPositions: vertices.reduce((acc, { key }) => {
      if (orderGrid[key] === undefined) {
        return acc;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gridPosition = orderGrid[key]!;

      acc[key] = {
        x: gridPosition.col * (2 * vertexRadius + minVertexDistance),
        y: gridPosition.row * (2 * vertexRadius + minVertexDistance)
      };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
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
  verticesPositions[rootVertex.key] = { row: 0, col: treeWidth / 2 };

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
      col: currentColumn + oldSubtreeWidth + childSubtreeWidth / 2
    };
  });
  return subtreeWidth;
};

const getLayout = <V, E>(
  vertexRadius: number,
  minVertexDistance: number,
  graph: DirectedGraph<V, E>
) => {
  const rootVertex = findRootVertex(graph) as DirectedGraphVertex<V, E>;
  const { width: maxTreeWidth, depth: maxTreeDepth } =
    getMaxTreeDimensions(rootVertex);

  const containerWidth = maxTreeWidth * (2 * vertexRadius + minVertexDistance);
  const containerHeight = maxTreeDepth * (2 * vertexRadius + minVertexDistance);

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
