import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView
      autoSizingTimeout={0}
      objectFit='contain'
      padding={500}
      scales={[0.25, 1, 2, 4]}>
      <UndirectedGraphComponent graph={graph} />
    </GraphView>
  );
}
