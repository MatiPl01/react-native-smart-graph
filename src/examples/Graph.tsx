import { useMemo } from 'react';
import { useWorkletCallback } from 'react-native-reanimated';
import {
  GraphView,
  GetLayerRadiusFunction,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  const getLayerRadius: GetLayerRadiusFunction = useWorkletCallback(
    ({ layerIndex }) => {
      return Math.log((layerIndex + 3) ** 3) * 100;
    },
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'custom',
            getLayerRadius
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
