import { useMemo } from 'react';
import {
  DirectedGraph,
  DirectedGraphComponent,
  DirectedGraphData,
  GraphView
} from 'react-native-smart-graph';

const SMALL_TREE = {
  edges: [
    { from: 'SV1', key: 'SE1', to: 'SV2' },
    { from: 'SV1', key: 'SE2', to: 'SV3' },
    { from: 'SV1', key: 'SE3', to: 'SV4' }
  ],
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }]
};

const LARGE_TREE = {
  edges: [
    { from: 'LV1', key: 'LE1', to: 'LV2' },
    { from: 'LV2', key: 'LE2', to: 'LV3' },
    { from: 'LV2', key: 'LE3', to: 'LV4' },
    { from: 'LV2', key: 'LE4', to: 'LV5' },
    { from: 'LV5', key: 'LE5', to: 'LV6' },
    { from: 'LV1', key: 'LE6', to: 'LV7' },
    { from: 'LV5', key: 'LE7', to: 'LV8' }
  ],
  vertices: [
    { key: 'LV1' },
    { key: 'LV2' },
    { key: 'LV3' },
    { key: 'LV4' },
    { key: 'LV5' },
    { key: 'LV6' },
    { key: 'LV7' },
    { key: 'LV8' }
  ]
};

const COMBINED_GRAPH: DirectedGraphData = {
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges],
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(COMBINED_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            minVertexSpacing: 100,
            strategy: 'trees'
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
