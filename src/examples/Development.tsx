import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { DirectedGraphComponent } from '..';

const ADDED_COMPONENTS = [
  { key: 'F', value: 'F' },
  { key: 'G', value: 'G' },
  { key: 'H', value: 'H' },
  { key: 'I', value: 'I' },
  { key: 'J', value: 'J' },
  { key: 'K', value: 'K' },
  { key: 'L', value: 'L' },
  {
    key: 'EK',
    from: 'E',
    to: 'K',
    value: 'EK'
  },
  {
    key: 'EL',
    from: 'E',
    to: 'L',
    value: 'EL'
  },
  {
    key: 'CF',
    from: 'C',
    to: 'F',
    value: 'CF'
  },
  { key: 'M', value: 'M' },
  { key: 'N', value: 'N' },
  { key: 'O', value: 'O' },
  {
    key: 'CG',
    from: 'C',
    to: 'G',
    value: 'CG'
  },
  {
    key: 'CH',
    from: 'C',
    to: 'H',
    value: 'CH'
  },
  {
    key: 'CI',
    from: 'C',
    to: 'I',
    value: 'CI'
  },
  {
    key: 'CJ',
    from: 'C',
    to: 'J',
    value: 'CJ'
  }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = new DirectedGraph({
    vertices: [
      { key: 'A', value: 'A' },
      { key: 'B', value: 'B' },
      { key: 'C', value: 'C' },
      { key: 'D', value: 'D' },
      { key: 'E', value: 'E' }
    ],
    edges: [
      {
        key: 'AB',
        from: 'A',
        to: 'B',
        value: 'AB'
      },

      {
        key: 'AC',
        from: 'A',
        to: 'C',
        value: 'AC'
      },
      {
        key: 'CD',
        from: 'C',
        to: 'D',
        value: 'CD'
      },
      {
        key: 'CE',
        from: 'C',
        to: 'E',
        value: 'CE'
      }
    ]
  });

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
            graph.insertEdge(component);
          } else {
            graph.insertVertex(component);
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
    }, 500);

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
                  strategy: 'circle',
                  minVertexSpacing: 120 // count
                },
                components: {
                  edge: {
                    type: 'curved'
                  }
                },
                layout: {
                  managedBy: 'forces'
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
