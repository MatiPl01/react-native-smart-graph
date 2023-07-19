/* eslint-disable import/no-unused-modules */
import { useMemo } from 'react';
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
    { from: 'V3', key: 'E3', to: 'V1' }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView>
      <DirectedGraphComponent graph={graph} />
    </GraphView>
  );
}
