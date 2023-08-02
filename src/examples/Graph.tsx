import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  VertexPressHandler,
  DefaultEdgeLabelRenderer,
  UndirectedGraphComponent,
  UndirectedGraphData,
  UndirectedGraph
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V4'] },
    { key: 'E4', vertices: ['V2', 'V5'] },
    { key: 'E5', vertices: ['V5', 'V6'] },
    { key: 'E6', vertices: ['V1', 'V7'] },
    { key: 'E7', vertices: ['V5', 'V8'] },
    { key: 'E71', vertices: ['V5', 'V8'] },
    { key: 'E72', vertices: ['V5', 'V8'] }
  ]
};

export default function Graph() {
  const [orbitsRoot, setOrbitsRoot] = useState('');

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const handEVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      setOrbitsRoot(key);
    },
    []
  );

  return (
    <GraphView objectFit='contain'>
      <UndirectedGraphComponent
        renderers={{
          label: DefaultEdgeLabelRenderer
        }}
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto', // <- doesn't have to be explicitly specified (it's a default option)
            roots: [orbitsRoot]
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handEVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
