import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  VertexPressHandler,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', vertices: ['SV1', 'SV2'] },
    { key: 'SE2', vertices: ['SV1', 'SV3'] },
    { key: 'SE3', vertices: ['SV1', 'SV4'] }
  ]
};

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
    { key: 'LE1', vertices: ['LV1', 'LV2'] },
    { key: 'LE2', vertices: ['LV2', 'LV3'] },
    { key: 'LE3', vertices: ['LV2', 'LV4'] },
    { key: 'LE4', vertices: ['LV2', 'LV5'] },
    { key: 'LE5', vertices: ['LV5', 'LV6'] },
    { key: 'LE6', vertices: ['LV1', 'LV7'] },
    { key: 'LE7', vertices: ['LV5', 'LV8'] }
  ]
};

const COMBINED_GRAPH: UndirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const [smallTreeRoot, setSmallTreeRoot] = useState('');
  const [largeTreeRoot, setLargeTreeRoot] = useState('');

  const graph = useMemo(() => new UndirectedGraph(COMBINED_GRAPH), []);

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
      <UndirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minVertexSpacing: 50
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handleVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
