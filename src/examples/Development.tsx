import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

export default function App() {
  const graph = new DirectedGraph({
    vertices: [
      { key: 'A', value: 'A' },
      { key: 'B', value: 'B' },
      { key: 'C', value: 'C' },
      { key: 'D', value: 'D' },
      { key: 'E', value: 'E' },
      { key: 'F', value: 'F' },
      { key: 'G', value: 'G' },
      { key: 'H', value: 'H' },
      { key: 'I', value: 'I' },
      { key: 'J', value: 'J' },
      { key: 'L', value: 'L' },
      { key: 'M', value: 'M' },
      { key: 'N', value: 'N' },
      { key: 'O', value: 'O' },
      { key: 'P', value: 'P' },
      { key: 'Q', value: 'Q' },
      { key: 'R', value: 'R' },
      { key: 'S', value: 'S' },
      { key: 'T', value: 'T' },
      { key: 'U', value: 'U' },
      { key: 'V', value: 'V' },
      { key: 'W', value: 'W' },
      { key: 'X', value: 'X' },
      { key: 'Y', value: 'Y' },
      { key: 'Z', value: 'Z' },
      { key: 'AA', value: 'AA' },
      { key: 'AB', value: 'AB' },
      { key: 'AC', value: 'AC' },
      { key: 'AD', value: 'AD' },
      { key: 'AE', value: 'AE' },
      { key: 'AF', value: 'AF' },
      { key: 'AG', value: 'AG' },
      { key: 'AH', value: 'AH' },
      { key: 'AI', value: 'AI' },
      { key: 'AJ', value: 'AJ' },
      { key: 'AK', value: 'AK' },
      { key: 'AL', value: 'AL' },
      { key: 'AM', value: 'AM' },
      { key: 'AN', value: 'AN' },
      { key: 'AO', value: 'AO' },
      { key: 'AP', value: 'AP' }
    ],
    edges: [
      { key: 'AB', from: 'A', to: 'B', value: 'AB' },
      { key: 'AC', from: 'A', to: 'C', value: 'AC' },
      { key: 'CF', from: 'C', to: 'F', value: 'CF' },
      { key: 'CE', from: 'C', to: 'E', value: 'CE' },
      { key: 'CD', from: 'C', to: 'D', value: 'CD' },
      // { key: 'DH', from: 'D', to: 'H', value: 'DH' },
      { key: 'EL', from: 'E', to: 'L', value: 'EL' },
      { key: 'FG', from: 'F', to: 'G', value: 'FG' },
      { key: 'LJ', from: 'L', to: 'J', value: 'LJ' }
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
