import { useMemo } from 'react';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView
      padding={{
        top: 500,
        right: 200
      }}
      autoSizingTimeout={500}
      initialScale={0.5}
      objectFit='contain'
      scales={[0.5, 1, 2]}>
      <DirectedGraphComponent
        settings={{
          placement: {
            strategy: 'circle',
            minVertexSpacing: 150
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
