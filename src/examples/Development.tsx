import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { DirectedGraphComponent } from '..';

export default function App() {
  const graph = new DirectedGraph({
    vertices: [{ key: 'A', value: 'A' }]
  });

  useEffect(() => {
    graph.insertVertex(
      { key: 'B', value: 'B' },
      {
        duration: 200,
        onComplete: () => {
          graph.insertEdge({ key: 'AB', value: 'AB', from: 'A', to: 'B' });
          graph.insertVertex(
            { key: 'C', value: 'C' },
            {
              duration: 400,
              onComplete: () => {
                graph.insertEdge({
                  key: 'BC',
                  value: 'BC',
                  from: 'B',
                  to: 'C'
                });
                graph.insertVertex(
                  { key: 'D', value: 'D' },
                  {
                    duration: 600,
                    onComplete: () => {
                      graph.insertEdge({
                        key: 'CD',
                        value: 'CD',
                        from: 'C',
                        to: 'D'
                      });
                      graph.insertVertex(
                        { key: 'E', value: 'E' },
                        {
                          duration: 800,
                          onComplete: () => {
                            graph.insertEdge({
                              key: 'DE',
                              value: 'DE',
                              from: 'D',
                              to: 'E'
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
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
