import { useMemo } from 'react';
import { useWorkletCallback } from 'react-native-reanimated';
import {
  DirectedGraph,
  DirectedGraphComponent,
  DirectedGraphData,
  GraphView
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  edges: [
    { from: 'V1', key: 'E1', to: 'V2' },
    { from: 'V2', key: 'E2', to: 'V3' },
    { from: 'V3', key: 'E3', to: 'V1' },
    { from: 'V5', key: 'E4', to: 'V6' },
    { from: 'V1', key: 'E5', to: 'V3' },
    { from: 'V1', key: 'E6', to: 'V4' },
    { from: 'V5', key: 'E7', to: 'V7' },
    { from: 'V2', key: 'E8', to: 'V8' }
  ],
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const sortComparator = useWorkletCallback(
    (a: string, b: string) => b.localeCompare(a),
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            minVertexSpacing: 150,
            sortComparator,
            sortVertices: true,
            strategy: 'circles'
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
