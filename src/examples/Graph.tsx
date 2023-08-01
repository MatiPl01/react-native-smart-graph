/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo } from 'react';
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const VERTICES_COUNT = 4;
const INTERVAL = 1000;

const VERTICES = new Array(VERTICES_COUNT).fill(null).map((_, i) => ({
  key: `${i}`
}));

let direction = 1;
let count = 0;

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
        if (count === VERTICES_COUNT) {
          direction = -1;
          graph.removeVertex(VERTICES[--count]!.key);
        } else {
          graph.insertVertex(VERTICES[count++]!);
        }
      } else if (count === 0) {
        direction = 1;
        graph.insertVertex(VERTICES[count++]!);
      } else {
        graph.removeVertex(VERTICES[--count]!.key);
      }
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
