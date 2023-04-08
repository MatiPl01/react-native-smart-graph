import Queue from '@/data/Queue';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphVertex, Vertex } from '@/types/graphs';
import {
  PlacedVerticesPositions,
  TreePlacementSettings
} from '@/types/placement';

import { findRootVertex, isGraphATree, isGraphDirected } from '../../graphs';

// TODO
const placeVerticesOnTree = <V, E>(
  props: PlacementProps<V, E>,
  settings: TreePlacementSettings<V, E>
): PlacedVerticesPositions => {
  const { graph } = props;

  // TODO - maybe add undirected graph support
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }
  if (!isGraphATree(graph)) {
    throw new Error('Cannot place vertices on rings for non-tree graph');
  }

  return {};
};

const createOrderGrid = <V, E>(
  graph: DirectedGraph<V, E>,
  settings?: TreePlacementSettings<V, E> // TODO - add settings support
): Record<string, { row: number; column: number }> => {
  const rootVertex = findRootVertex(graph);
  if (!rootVertex) {
    return {};
  }

  // TODO - finish this
  const orderGrid: Record<string, { row: number; column: number }> = {};
  const rowNodeCounts: Record<number, number> = {};

  const queue = new Queue<{ row: number; vertex: Vertex<V, E> }>();
  queue.enqueue({ row: 0, vertex: rootVertex });

  while (!queue.isEmpty()) {
    const { row, vertex } = queue.dequeue() as {
      row: number;
      vertex: DirectedGraphVertex<V, E>;
    };
    if (!rowNodeCounts[row]) {
      rowNodeCounts[row] = 0;
    }
    orderGrid[vertex.key] = { row, column: rowNodeCounts[row] as number };
    rowNodeCounts[row]++;
    vertex.outEdges.forEach(edge => {
      queue.enqueue({ row: row + 1, vertex: edge.target });
    });
  }
};

export default placeVerticesOnTree;
