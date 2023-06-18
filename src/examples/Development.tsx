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
    from: 'E',
    key: 'EK',
    to: 'K',
    value: 'EK'
  },
  {
    from: 'E',
    key: 'EL',
    to: 'L',
    value: 'EL'
  },
  {
    from: 'C',
    key: 'CF',
    to: 'F',
    value: 'CF'
  },
  { key: 'M', value: 'M' },
  { key: 'N', value: 'N' },
  { key: 'O', value: 'O' },
  {
    from: 'C',
    key: 'CG',
    to: 'G',
    value: 'CG'
  },
  {
    from: 'C',
    key: 'CH',
    to: 'H',
    value: 'CH'
  },
  {
    from: 'C',
    key: 'CI',
    to: 'I',
    value: 'CI'
  },
  {
    from: 'C',
    key: 'CJ',
    to: 'J',
    value: 'CJ'
  }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = new DirectedGraph({
    edges: [
      {
        from: 'A',
        key: 'AB',
        to: 'B',
        value: 'AB'
      },

      {
        from: 'A',
        key: 'AC',
        to: 'C',
        value: 'AC'
      },
      {
        from: 'C',
        key: 'CD',
        to: 'D',
        value: 'CD'
      },
      {
        from: 'C',
        key: 'CE',
        to: 'E',
        value: 'CE'
      }
    ],
    vertices: [
      { key: 'A', value: 'A' },
      { key: 'B', value: 'B' },
      { key: 'C', value: 'C' },
      { key: 'D', value: 'D' },
      { key: 'E', value: 'E' }
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
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <PannableScalableView controls objectFit='contain'>
            <DirectedGraphComponent
              renderers={{
                label: DefaultEdgeLabelRenderer
              }}
              settings={{
                layout: {
                  managedBy: 'forces'
                }
              }}
              graph={graph}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'black',
    flex: 1
  },
  container: {
    flex: 1
  },
  gestureHandler: {
    flex: 1
  }
});
