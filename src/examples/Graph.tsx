import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent,
  VertexPressHandler
} from 'react-native-smart-graph';

// const ORBITS_GRAPH: DirectedGraphData = {
//   vertices: [
//     { key: 'V0' }, // root
//     // First orbit vertices
//     { key: 'V1' },
//     { key: 'V2' },
//     { key: 'V3' },
//     { key: 'V4' },
//     { key: 'V5' },
//     // Second orbit vertices
//     { key: 'V6' },
//     { key: 'V7' },
//     { key: 'V8' },
//     { key: 'V9' },
//     { key: 'V10' },
//     { key: 'V11' },
//     { key: 'V12' },
//     { key: 'V13' },
//     { key: 'V14' },
//     { key: 'V15' }
//   ],
//   edges: [
//     // Edges from root to first orbit
//     { key: 'E0', from: 'V0', to: 'V1' },
//     { key: 'E1', from: 'V0', to: 'V2' },
//     { key: 'E2', from: 'V0', to: 'V3' },
//     { key: 'E3', from: 'V0', to: 'V4' },
//     { key: 'E4', from: 'V0', to: 'V5' },
//     // Edges from first orbit to second orbit
//     // V1 has 1 child
//     { key: 'E5', from: 'V1', to: 'V6' },
//     // V2 has 2 children
//     { key: 'E6', from: 'V2', to: 'V7' },
//     { key: 'E7', from: 'V2', to: 'V8' },
//     // V3 has 3 children
//     { key: 'E8', from: 'V3', to: 'V9' },
//     { key: 'E9', from: 'V3', to: 'V10' },
//     { key: 'E10', from: 'V3', to: 'V11' },
//     // V4 has 4 children
//     { key: 'E11', from: 'V4', to: 'V12' },
//     { key: 'E12', from: 'V4', to: 'V13' },
//     { key: 'E13', from: 'V4', to: 'V14' },
//     { key: 'E14', from: 'V4', to: 'V15' }
//   ]
// };

export default function Graph() {
  const [orbitsRoot, setOrbitsRoot] = useState('');

  const graph = useMemo(
    () =>
      new DirectedGraph({
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
      }),
    []
  );

  const handEVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      setOrbitsRoot(key);
    },
    []
  );

  return (
    <GraphView objectFit='none' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto', // <- doesn't have to be explicitly specified (it's a default option)
            roots: [orbitsRoot],
            maxSectorAngle: 0.25 * Math.PI
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
