import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { DirectedGraphComponent } from '..';

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
      },
      {
        from: 'B',
        key: 'BF',
        to: 'F',
        value: 'BF'
      }
    ],
    vertices: [
      { key: 'A', value: 'A' },
      { key: 'B', value: 'B' },
      { key: 'C', value: 'C' },
      { key: 'D', value: 'D' },
      { key: 'E', value: 'E' },
      { key: 'F', value: 'F' }
    ]
  });

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
                events: {
                  onVertexLongPress({ vertex: { key } }) {
                    console.log(`Vertex ${key} long pressed`);
                  },
                  onVertexPress({ vertex: { key } }) {
                    console.log(`Vertex ${key} pressed`);
                  }
                },
                layout: {
                  managedBy: 'forces'
                },
                placement: {
                  strategy: 'circle'
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
