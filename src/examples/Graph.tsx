import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V1', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V3'] },
    { key: 'E4', vertices: ['V3', 'V1'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V3', 'V1'] },
    { key: 'E7', vertices: ['V3', 'V2'] },
    { key: 'E8', vertices: ['V3', 'V1'] },
    { key: 'E9', vertices: ['V2', 'V1'] }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          // --- Graph components settings ---
          components: {
            edge: {
              type: 'curved'
            }
          },
          // --- End of graph components settings ---
          placement: {
            strategy: 'circle',
            minVertexSpacing: 75
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
