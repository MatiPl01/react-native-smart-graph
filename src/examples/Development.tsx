import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

const ADDED_COMPONENTS = [
  { key: 'B', data: 'B' },
  {
    key: 'AB',
    from: 'A',
    to: 'B',
    data: 'AB'
  },
  { key: 'C', data: 'C' },
  {
    key: 'AC',
    from: 'A',
    to: 'C',
    data: 'AC'
  },
  { key: 'D', data: 'D' },
  { key: 'E', data: 'E' },
  {
    key: 'CD',
    from: 'C',
    to: 'D',
    data: 'CD'
  },
  {
    key: 'CE',
    from: 'C',
    to: 'E',
    data: 'CE'
  },
  { key: 'F', data: 'F' },
  { key: 'G', data: 'G' },
  { key: 'H', data: 'H' },
  { key: 'I', data: 'I' },
  { key: 'J', data: 'J' },
  { key: 'K', data: 'K' },
  { key: 'L', data: 'L' },
  {
    key: 'EK',
    from: 'E',
    to: 'K',
    data: 'EK'
  },
  {
    key: 'EL',
    from: 'E',
    to: 'L',
    data: 'EL'
  },
  {
    key: 'CF',
    from: 'C',
    to: 'F',
    data: 'CF'
  },
  { key: 'M', data: 'M' },
  { key: 'N', data: 'N' },
  { key: 'O', data: 'O' },
  {
    key: 'CG',
    from: 'C',
    to: 'G',
    data: 'CG'
  },
  {
    key: 'CH',
    from: 'C',
    to: 'H',
    data: 'CH'
  },
  {
    key: 'CI',
    from: 'C',
    to: 'I',
    data: 'CI'
  },
  {
    key: 'CJ',
    from: 'C',
    to: 'J',
    data: 'CJ'
  }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = DirectedGraph.fromData({ vertices: [{ key: 'A', data: 'A' }] });

  // TODO - remove this useEffect after testing
  useEffect(() => {
    const interval = setInterval(() => {
      if (idx < 0 || idx >= ADDED_COMPONENTS.length) {
        mode = mode === 0 ? 1 : 0;
        idx = Math.max(0, Math.min(ADDED_COMPONENTS.length - 1, idx));
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const component = ADDED_COMPONENTS[idx]!;

      try {
        if (mode === 0) {
          if (component.from && component.to) {
            graph.insertEdge(
              component.key,
              component.data,
              component.from,
              component.to
            );
          } else {
            graph.insertVertex(component.key, component.data);
          }
          idx++;
        } else {
          if (component.from && component.to) {
            graph.removeEdge(component.key);
          } else {
            graph.removeVertex(component.key);
          }
          idx--;
        }
      } catch (e) {
        clearInterval(interval);
        console.error(e);
        return;
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <PannableScalableView objectFit='contain' controls>
            <DirectedGraphComponent
              graph={graph}
              settings={{
                placement: {
                  strategy: 'trees',
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
