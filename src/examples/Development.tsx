/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SequenceAnimation from '@/animations/GraphTimeline';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import { DirectedGraphComponent } from '..';

export default function App() {
  const graph = new DirectedGraph({
    vertices: [{ key: 'A', value: 'A' }]
  });

  useEffect(() => {
    const vertices1 = [...'ABCDEFG'];
    const vertices2 = [...'HIJKLMNOPQRS'];

    const animation = new SequenceAnimation(graph)
      .insertSequential(
        vertices1.slice(1).map(key => [
          { key, value: [] },
          {
            key: `A${key}0`,
            from: 'A',
            to: key,
            value: []
          }
        ]),
        1000
      )
      .insertSequential(
        vertices1
          .slice(1)
          .map(key =>
            new Array(6).fill(0).map((_, i) => [
              {
                ...(i % 2
                  ? { key: `A${key}${i + 1}`, from: 'A', to: key }
                  : {
                      key: `${key}A${i + 1}`,
                      from: key,
                      to: 'A'
                    }),
                value: []
              }
            ])
          )
          .flat(),
        1000
      )
      .insertSequential(
        vertices2.map((key, i) => [
          { key, value: [] },
          {
            key: `${vertices1[Math.floor((i + 2) / 2)]!}${key}0`,
            from: vertices1[Math.floor((i + 2) / 2)]!,
            to: key,
            value: []
          }
        ]),
        1000
      )
      .insertSequential(
        vertices2
          .map((key, i) =>
            new Array(3).fill(0).map((_, j) => [
              {
                ...(j % 2
                  ? {
                      key: `${vertices1[Math.floor((i + 2) / 2)]!}${key}${
                        j + 1
                      }`,
                      from: vertices1[Math.floor((i + 2) / 2)]!,
                      to: key
                    }
                  : {
                      key: `${key}${vertices1[Math.floor((i + 2) / 2)]!}${
                        j + 1
                      }`,
                      from: key,
                      to: vertices1[Math.floor((i + 2) / 2)]!
                    }),
                value: []
              }
            ])
          )
          .flat(),
        1000
      );

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      animation.play();
    }, 1000);
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
