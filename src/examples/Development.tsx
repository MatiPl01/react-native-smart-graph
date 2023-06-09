import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import UndirectedGraphComponent from '@/components/graphs/UndirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const graph = new DirectedGraph({
    vertices: [
      { key: 'A', data: 'A' },
      { key: 'B', data: 'B' },
      { key: 'C', data: 'C' },
      { key: 'D', data: 'D' },
      { key: 'E', data: 'E' },
      { key: 'F', data: 'F' },
      { key: 'G', data: 'G' },
      { key: 'H', data: 'H' },
      { key: 'I', data: 'I' },
      { key: 'J', data: 'J' },
      { key: 'L', data: 'L' },
      { key: 'M', data: 'M' },
      { key: 'N', data: 'N' },
      { key: 'O', data: 'O' },
      { key: 'P', data: 'P' },
      { key: 'Q', data: 'Q' },
      { key: 'R', data: 'R' },
      { key: 'S', data: 'S' },
      { key: 'T', data: 'T' },
      { key: 'U', data: 'U' },
      { key: 'V', data: 'V' },
      { key: 'W', data: 'W' },
      { key: 'X', data: 'X' },
      { key: 'Y', data: 'Y' },
      { key: 'Z', data: 'Z' },
      { key: 'AA', data: 'AA' },
      { key: 'AB', data: 'AB' },
      { key: 'AC', data: 'AC' },
      { key: 'AD', data: 'AD' },
      { key: 'AE', data: 'AE' },
      { key: 'AF', data: 'AF' },
      { key: 'AG', data: 'AG' },
      { key: 'AH', data: 'AH' },
      { key: 'AI', data: 'AI' },
      { key: 'AJ', data: 'AJ' },
      { key: 'AK', data: 'AK' },
      { key: 'AL', data: 'AL' },
      { key: 'AM', data: 'AM' },
      { key: 'AN', data: 'AN' },
      { key: 'AO', data: 'AO' },
      { key: 'AP', data: 'AP' }
    ],
    edges: [
      { key: 'AB', from: 'A', to: 'B', data: 'AB' },
      { key: 'AC', from: 'A', to: 'C', data: 'AC' },
      { key: 'CF', from: 'C', to: 'F', data: 'CF' },
      { key: 'CE', from: 'C', to: 'E', data: 'CE' },
      { key: 'CD', from: 'C', to: 'D', data: 'CD' },
      // { key: 'DH', from: 'D', to: 'H', data: 'DH' },
      { key: 'EL', from: 'E', to: 'L', data: 'EL' },
      { key: 'FG', from: 'F', to: 'G', data: 'FG' },
      { key: 'LJ', from: 'L', to: 'J', data: 'LJ' }
    ]
  });

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <PannableScalableView objectFit='contain' controls>
            <DirectedGraphComponent
              graph={graph}
              settings={{
                placement: {
                  strategy: 'orbits',
                  minVertexSpacing: 120
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
