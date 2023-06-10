import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { DirectedGraphComponent } from '..';

export default function App() {
  const [count, setCount] = useState(0);
  const [obFit, setObFit] = useState<'contain' | 'cover'>('contain');

  console.log(count, obFit);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        graph.insertVertex({ key: String(c), value: String(c) });
        return c + 1;
      });
      setObFit(o => (o === 'contain' ? 'cover' : 'contain'));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const graph = useMemo(
    () =>
      new DirectedGraph({
        vertices: [
          { key: 'A', value: 'A' },
          { key: 'B', value: 'B' },
          { key: 'C', value: 'C' },
          { key: 'D', value: 'D' }
        ]
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <View style={styles.background}>
          <PannableScalableView objectFit={obFit} controls>
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
