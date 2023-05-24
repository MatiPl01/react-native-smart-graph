import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

const GRAPH1 = {
  vertices: [
    { key: 'A', data: 'A' },
    { key: 'B', data: 'B' },
    { key: 'C', data: 'C' },
    { key: 'D', data: 'D' },
    { key: 'E', data: 'E' }
  ],
  edges: [
    { key: 'AB', from: 'A', to: 'B', data: 'AB' },
    { key: 'AC', from: 'A', to: 'C', data: 'AC' },
    { key: 'AD', from: 'A', to: 'D', data: 'AD' },
    { key: 'AE', from: 'A', to: 'E', data: 'AE' }
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
    { key: 'FG', from: 'F', to: 'G', data: 'FG' },
    { key: 'FH', from: 'F', to: 'H', data: 'FH' },
    { key: 'FI', from: 'F', to: 'I', data: 'FI' },
    { key: 'GJ', from: 'G', to: 'J', data: 'GJ' },
    { key: 'GK', from: 'G', to: 'K', data: 'GK' },
    { key: 'GL', from: 'G', to: 'L', data: 'GL' },
    { key: 'GM', from: 'G', to: 'M', data: 'GM' },
    { key: 'GN', from: 'G', to: 'N', data: 'GN' },
    { key: 'GO', from: 'G', to: 'O', data: 'GO' }
  ]
};

const GRAPH3 = {
  vertices: [
    { key: 'P', data: 'P' },
    { key: 'Q', data: 'Q' }
  ],
  edges: [
    { key: 'PQ1', from: 'P', to: 'Q', data: 'PQ1' },
    { key: 'PQ2', from: 'P', to: 'Q', data: 'PQ2' }
  ]
};

const DISCONNECTED_GRAPH = {
  vertices: [...GRAPH1.vertices, ...GRAPH2.vertices, ...GRAPH3.vertices],
  edges: [...GRAPH1.edges, ...GRAPH2.edges, ...GRAPH3.edges]
};

export default function App() {
  const graph = DirectedGraph.fromData(
    DISCONNECTED_GRAPH.vertices,
    DISCONNECTED_GRAPH.edges
  );

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='contain' controls>
            <DirectedGraphComponent
              graph={graph}
              settings={{
                // TODO - fix orbits strategy padding
                placement: {
                  strategy: 'circles',
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
