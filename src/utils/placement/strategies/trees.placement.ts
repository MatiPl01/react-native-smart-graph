/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GraphConnections } from '@/types/models';
import {
  AllTreesPlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
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
  minColumnDistance: number,
  minRowDistance: number
): PlacedVerticesPositions => {
  'worklet';
  // determine the width and height of the grid
  const { numCols, numRows } = Object.values(arrangedVertices).reduce(
    (acc, { col, row }) => ({
      numCols: Math.max(acc.numCols, col + 1),
      numRows: Math.max(acc.numRows, row + 1)
    }),
    { numCols: 0, numRows: 0 }
  );

  // calculate the width and height of the grid as well as the padding
  const width = (numCols - 1) * minColumnDistance;
  const height = (numRows - 1) * minRowDistance;

  // calculate the positions of the vertices based on the grid
  return Object.entries(arrangedVertices).reduce((acc, [key, { col, row }]) => {
    acc[key] = {
      x: col * minColumnDistance - width / 2,
      y: row * minRowDistance - height / 2
    };
    return acc;
  }, {} as PlacedVerticesPositions);
};

export default function placeVerticesOnTrees(
  connections: GraphConnections,
  isGraphDirected: boolean,
  settings: AllTreesPlacementSettings
): GraphLayout {
  'worklet';
  const componentsLayouts: Array<GraphLayout> = [];
  const rootVertexKeys = new Set(settings.roots);

  const graphComponents = findGraphComponents(connections);

  const { minColumnDistance, minRowDistance } = settings;
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
      minColumnDistance,
      minRowDistance
    );
    // Calculate container dimensions
    componentsLayouts.push({
      boundingRect: calcContainerBoundingRect(verticesPositions),
      verticesPositions
    });
  }

  return arrangeGraphComponents(componentsLayouts, {
    horizontal: minColumnDistance,
    vertical: minRowDistance
  });
}
