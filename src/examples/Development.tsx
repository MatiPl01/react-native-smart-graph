import React, { useEffect, useMemo, useRef } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import GraphView, { GraphViewRef } from '@/components/views/GraphView';
import { DirectedGraph } from '@/models/graphs';

import { DefaultEdgeLabelRenderer, DirectedGraphComponent } from '..';

export default function App() {
  const graph = useMemo(
    () =>
      new DirectedGraph({
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
      }),
    []
  );
  const canvasRef = useRef<GraphViewRef | null>(null);

  useEffect(() => {
    setTimeout(() => {
      canvasRef.current?.focus('A');
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <GraphView controls objectFit='contain' ref={canvasRef}>
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
          </GraphView>
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
