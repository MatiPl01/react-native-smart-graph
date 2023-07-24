/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { GraphConnections } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  TreesPlacementSettings
} from '@/types/settings';
import {
  bfs,
  dfs,
  findGraphComponents,
  findRootVertex,
  transposeIncoming
} from '@/utils/algorithms';
import {
  arrangeGraphComponents,
  calcContainerBoundingRect
} from '@/utils/placement/shared';

type VertexPosition = { col: number; row: number };

const arrangeVertices = (
  connections: GraphConnections,
  rootVertex: string
): Record<string, VertexPosition> => {
  'worklet';
  // Calculate subtree widths
  const subtreeWidths: Record<string, number> = {};
  dfs(connections, [rootVertex], ({ parent, vertex }) => {
    if (!subtreeWidths[vertex]) {
      subtreeWidths[vertex] = 1;
    }
    if (parent) {
      if (!subtreeWidths[parent]) {
        subtreeWidths[parent] = 0;
      }
      subtreeWidths[parent] += subtreeWidths[vertex]!;
    }
  });

  // Arrange vertices
  const arrangedVertices: Record<string, VertexPosition> = {
    [rootVertex]: { col: subtreeWidths[rootVertex]! / 2, row: 0 }
  };

  let prevData: {
    depth: number;
    parent: null | string;
    vertex: string;
  } | null = null;

  bfs(connections, [rootVertex], data => {
    const { depth, parent, vertex } = data;

    if (parent) {
      let col = 0;
      if (prevData?.parent === parent) {
        col =
          arrangedVertices[prevData.vertex]!.col +
          subtreeWidths[prevData.vertex]! / 2 +
          subtreeWidths[vertex]! / 2;
      } else {
        col =
          arrangedVertices[parent]!.col -
          subtreeWidths[parent]! / 2 +
          subtreeWidths[vertex]! / 2;
      }

      arrangedVertices[vertex] = { col, row: depth };
    }

    prevData = data;
  });

  return arrangedVertices;
};

const placeVertices = (
  arrangedVertices: Record<string, { col: number; row: number }>,
  minVertexSpacing: number,
  vertexRadius: number
): PlacedVerticesPositions => {
  'worklet';
  // determine the minimum distance between vertices
  const padding = 2 * vertexRadius;
  const minVertexCenterDistance = padding + minVertexSpacing;

  // determine the width and height of the grid
  const { numCols, numRows } = Object.values(arrangedVertices).reduce(
    (acc, { col, row }) => ({
      numCols: Math.max(acc.numCols, col + 1),
      numRows: Math.max(acc.numRows, row + 1)
    }),
    { numCols: 0, numRows: 0 }
  );

  // calculate the width and height of the grid as well as the padding
  const width = padding + (numCols - 1) * minVertexCenterDistance;
  const height = padding + (numRows - 1) * minVertexCenterDistance;

  // calculate the positions of the vertices based on the grid
  return Object.entries(arrangedVertices).reduce((acc, [key, { col, row }]) => {
    acc[key] = {
      x: vertexRadius + col * minVertexCenterDistance - width / 2,
      y: vertexRadius + row * minVertexCenterDistance - height / 2
    };
    return acc;
  }, {} as PlacedVerticesPositions);
};

export default function placeVerticesOnTrees(
  connections: GraphConnections,
  vertexRadius: number,
  isGraphDirected: boolean,
  settings: TreesPlacementSettings
): GraphLayout {
  'worklet';
  const componentsLayouts: Array<GraphLayout> = [];
  const rootVertexKeys = new Set(settings.roots);

  const graphComponents = findGraphComponents(connections);

  const minVertexSpacing =
    settings.minVertexSpacing ?? SHARED_PLACEMENT_SETTINGS.minVertexSpacing;

  for (const component of graphComponents) {
    // Find the root vertex of the component
    const rootVertex = findRootVertex(
      connections,
      component,
      rootVertexKeys,
      isGraphDirected
    );
    // If the graph is directed and the selected root has incoming edges,
    // transpose all subtrees with incoming edges to make the root vertex
    // the source vertex
    let updatedConnections = connections;
    if (isGraphDirected && connections[rootVertex]!.incoming.length > 0) {
      updatedConnections = transposeIncoming(connections, [rootVertex]);
    }
    const arrangedVertices = arrangeVertices(updatedConnections, rootVertex);
    // Place vertices in the layout

    const verticesPositions = placeVertices(
      arrangedVertices,
      minVertexSpacing,
      vertexRadius
    );
    // Calculate container dimensions
    componentsLayouts.push({
      boundingRect: calcContainerBoundingRect(verticesPositions, {
        padding: vertexRadius
      }),
      verticesPositions
    });
  }

  return arrangeGraphComponents(componentsLayouts, minVertexSpacing);
}
