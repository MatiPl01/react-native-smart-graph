import { useMemo } from 'react';
import { useWorkletCallback } from 'react-native-reanimated';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' },
    { key: 'E4', from: 'V4', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V3' },
    { key: 'E7', from: 'V1', to: 'V4' }
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
            strategy: 'circle',
            minVertexSpacing: 150,
            sortVertices: true,
            sortComparator
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
