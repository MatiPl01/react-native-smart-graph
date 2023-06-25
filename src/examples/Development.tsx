import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import GraphView from '@/components/views/GraphView';
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
      }),
    []
  );

  useEffect(() => {
    setTimeout(() => {
      graph.focus('A', {
        alignment: {
          horizontalAlignment: 'left',
          horizontalOffset: 50
        },
        vertexScale: 3
      });
    }, 1000);
    setTimeout(() => {
      graph.focus('E', {
        alignment: {
          horizontalAlignment: 'right',
          horizontalOffset: 50,
          verticalAlignment: 'bottom',
          verticalOffset: 150
        }
      });
    }, 3000);
    setTimeout(() => {
      graph.blur();
    }, 5000);
  }, [graph]);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <GraphView controls objectFit='contain'>
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
