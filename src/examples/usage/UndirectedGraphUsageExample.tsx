/* eslint-disable import/no-unused-modules */
import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView>
      <UndirectedGraphComponent graph={graph} />
    </GraphView>
  );
}
