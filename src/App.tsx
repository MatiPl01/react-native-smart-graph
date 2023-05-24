import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { UndirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import UndirectedGraphComponent from './components/graphs/UndirectedGraphComponent';

const GRAPH1 = {
  vertices: [
    { key: 'A', data: 'A' },
    { key: 'B', data: 'B' },
    { key: 'C', data: 'C' },
    { key: 'D', data: 'D' },
    { key: 'E', data: 'E' }
  ],
  edges: [
    { key: 'AB', vertices: ['A', 'B'], data: 'AB' },
    { key: 'AC', vertices: ['A', 'C'], data: 'AC' },
    { key: 'AD', vertices: ['A', 'D'], data: 'AD' },
    { key: 'AE', vertices: ['A', 'E'], data: 'AE' }
  ]
};

const GRAPH2 = {
  vertices: [
    { key: 'F', data: 'F' },
    { key: 'G', data: 'G' },
    { key: 'H', data: 'H' },
    { key: 'I', data: 'I' },
    { key: 'J', data: 'J' },
    { key: 'K', data: 'K' },
    { key: 'L', data: 'L' },
    { key: 'M', data: 'M' },
    { key: 'N', data: 'N' },
    { key: 'O', data: 'O' }
  ],
  edges: [
    { key: 'FG', vertices: ['F', 'G'], data: 'FG' },
    { key: 'FH', vertices: ['F', 'H'], data: 'FH' },
    { key: 'FI', vertices: ['F', 'I'], data: 'FI' },
    { key: 'GJ', vertices: ['G', 'J'], data: 'GJ' },
    { key: 'GK', vertices: ['G', 'K'], data: 'GK' },
    { key: 'GL', vertices: ['G', 'L'], data: 'GL' },
    { key: 'GM', vertices: ['G', 'M'], data: 'GM' },
    { key: 'GN', vertices: ['G', 'N'], data: 'GN' },
    { key: 'GO', vertices: ['G', 'O'], data: 'GO' }
  ]
};

const GRAPH3 = {
  vertices: [
    { key: 'P', data: 'P' },
    { key: 'Q', data: 'Q' }
  ],
  edges: [
    { key: 'PQ1', vertices: ['P', 'Q'], data: 'PQ1' },
    { key: 'PQ2', vertices: ['P', 'Q'], data: 'PQ2' }
  ]
};

const DISCONNECTED_GRAPH = {
  vertices: [...GRAPH1.vertices, ...GRAPH2.vertices, ...GRAPH3.vertices],
  edges: [...GRAPH1.edges, ...GRAPH2.edges, ...GRAPH3.edges]
};

let phase = 0;

export default function App() {
  const graph = UndirectedGraph.fromData(
    DISCONNECTED_GRAPH.vertices,
    DISCONNECTED_GRAPH.edges
  );

  useEffect(() => {
    setInterval(() => {
      if (phase === 0) {
        graph.insertEdge('PC', '', 'P', 'C');
      } else if (phase === 1) {
        graph.insertEdge('CI', '', 'C', 'I');
      } else if (phase === 2) {
        graph.removeEdge('PC');
      } else if (phase === 3) {
        graph.removeEdge('CI');
      }
      phase = (phase + 1) % 4;
    }, 1000);
  }, [graph]);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='contain' controls>
            <UndirectedGraphComponent
              graph={graph}
              settings={{
                // TODO - fix orbits strategy padding
                placement: {
                  strategy: 'orbits',
                  layerSizing: 'equal',
                  minVertexSpacing: 100
                },
                components: {
                  edge: {
                    type: 'curved'
                  }
                }
              }}
              renderers={{
                label: DefaultEdgeLabelRenderer
              }}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
