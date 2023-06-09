import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { UndirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { UndirectedGraphComponent } from '..';

const GRAPH1 = {
  vertices: [
    { key: 'A', value: 'A' },
    { key: 'B', value: 'B' },
    { key: 'C', value: 'C' },
    { key: 'D', value: 'D' },
    { key: 'E', value: 'E' }
  ],
  edges: [
    { key: 'AB', vertices: ['A', 'B'], value: 'AB' },
    { key: 'AC', vertices: ['A', 'C'], value: 'AC' },
    { key: 'AD', vertices: ['A', 'D'], value: 'AD' },
    { key: 'AE', vertices: ['A', 'E'], value: 'AE' }
  ]
};

const GRAPH2 = {
  vertices: [
    { key: 'F', value: 'F' },
    { key: 'G', value: 'G' },
    { key: 'H', value: 'H' },
    { key: 'I', value: 'I' },
    { key: 'J', value: 'J' },
    { key: 'K', value: 'K' },
    { key: 'L', value: 'L' },
    { key: 'M', value: 'M' },
    { key: 'N', value: 'N' },
    { key: 'O', value: 'O' }
  ],
  edges: [
    { key: 'FG', vertices: ['F', 'G'], value: 'FG' },
    { key: 'FH', vertices: ['F', 'H'], value: 'FH' },
    { key: 'FI', vertices: ['F', 'I'], value: 'FI' },
    { key: 'GJ', vertices: ['G', 'J'], value: 'GJ' },
    { key: 'GK', vertices: ['G', 'K'], value: 'GK' },
    { key: 'GL', vertices: ['G', 'L'], value: 'GL' },
    { key: 'GM', vertices: ['G', 'M'], value: 'GM' },
    { key: 'GN', vertices: ['G', 'N'], value: 'GN' },
    { key: 'GO', vertices: ['G', 'O'], value: 'GO' }
  ]
};

const GRAPH3 = {
  vertices: [
    { key: 'P', value: 'P' },
    { key: 'Q', value: 'Q' }
  ],
  edges: [
    { key: 'PQ1', vertices: ['P', 'Q'], value: 'PQ1' },
    { key: 'PQ2', vertices: ['P', 'Q'], value: 'PQ2' }
  ]
};

const DISCONNECTED_GRAPH = {
  vertices: [...GRAPH1.vertices, ...GRAPH2.vertices, ...GRAPH3.vertices],
  edges: [...GRAPH1.edges, ...GRAPH2.edges, ...GRAPH3.edges]
};

let phase = 0;

export default function App() {
  const graph = new UndirectedGraph(DISCONNECTED_GRAPH);

  useEffect(() => {
    setInterval(() => {
      if (phase === 0) {
        graph.insertEdge({
          key: 'PC',
          vertices: ['P', 'C'],
          value: 'PC'
        });
      } else if (phase === 1) {
        graph.insertEdge({
          key: 'CI',
          vertices: ['C', 'I'],
          value: 'CI'
        });
      } else if (phase === 2) {
        graph.removeEdge('PC');
      } else if (phase === 3) {
        graph.removeEdge('CI');
      }
      phase = (phase + 1) % 4;
    }, 1500);
  }, [graph]);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <PannableScalableView
            scales={[0.1, 1, 2, 4]}
            objectFit='contain'
            controls>
            <UndirectedGraphComponent
              graph={graph}
              settings={{
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gestureHandler: {
    flex: 1
  },
  background: {
    flex: 1,
    backgroundColor: 'black'
  }
});
