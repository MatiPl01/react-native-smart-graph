/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo } from 'react';
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const VERTICES_COUNT = 25;
const INTERVAL = 1000;

const VERTICES = new Array(VERTICES_COUNT).fill(null).map((_, i) => ({
  key: `${i}`
}));

let direction = 1;

export default function Graph() {
  const graph = useMemo(
    () =>
      new DirectedGraph({
        vertices: [{ key: '-1' }] // TODO - fix not rendering when no vertices
      }),
    []
  );

  useEffect(() => {
    setInterval(() => {
      if (direction === 1) {
        graph.insertBatch({
          vertices: VERTICES
        });
      } else {
        graph.removeBatch({
          vertices: VERTICES.map(({ key }) => key)
        });
      }
      direction *= -1;
    }, INTERVAL);
  }, []);

  return (
    <GraphView objectFit='contain'>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'random',
            mesh: 'random'
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
