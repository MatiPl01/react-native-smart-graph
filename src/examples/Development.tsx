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
    setTimeout(() => {
      graph.insertVertex({ key: 'B', value: 'B' }, { duration: 100 });
    }, 200);

    // const interval = setInterval(() => {}, 500);

    // return () => clearInterval(interval);
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
                  strategy: 'orbits',
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
