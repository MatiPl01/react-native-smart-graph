import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent,
  DirectedGraphData,
  VertexPressHandler
} from 'react-native-smart-graph';

const LARGE_TREE = {
  vertices: [
    { key: 'LV1' },
    { key: 'LV2' },
    { key: 'LV3' },
    { key: 'LV4' },
    { key: 'LV5' },
    { key: 'LV6' },
    { key: 'LV7' },
    { key: 'LV8' }
  ],
  edges: [
    { key: 'LE1', from: 'LV1', to: 'LV2' },
    { key: 'LE2', from: 'LV2', to: 'LV3' },
    { key: 'LE3', from: 'LV2', to: 'LV4' },
    { key: 'LE4', from: 'LV2', to: 'LV5' },
    { key: 'LE5', from: 'LV5', to: 'LV6' },
    { key: 'LE6', from: 'LV1', to: 'LV7' },
    { key: 'LE7', from: 'LV5', to: 'LV8' }
  ]
};

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', from: 'SV1', to: 'SV2' },
    { key: 'SE2', from: 'SV1', to: 'SV3' },
    { key: 'SE3', from: 'SV1', to: 'SV4' }
  ]
};

const COMBINED_GRAPH: DirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const [smallTreeRoot, setSmallTreeRoot] = useState('');
  const [largeTreeRoot, setLargeTreeRoot] = useState('');

  const graph = useMemo(() => new DirectedGraph(COMBINED_GRAPH), []);

  const handleVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      if (key.startsWith('SV')) {
        setSmallTreeRoot(key);
      } else {
        setLargeTreeRoot(key);
      }
    },
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minColumnDistance: 50,
            minRowDistance: 50
          },
          // --- End of placement settings ---
          events: {
            press: {
              onVertexPress: handleVertexPress
            }
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
