import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import GraphView from '@/components/views/GraphView';
import { DirectedGraph } from '@/models/graphs';

import {
  DefaultEdgeLabelRenderer,
  DirectedEdgeData,
  DirectedGraphComponent,
  GraphViewControls,
  ObjectFit,
  VertexData,
  VertexPressHandler
} from '..';

const ADDED_COMPONENTS = [
  { key: 'V2' },
  { from: 'V1', key: 'E1', to: 'V2' },
  { key: 'V3' },
  { from: 'V1', key: 'E2', to: 'V3' },
  { key: 'V4' },
  { from: 'V3', key: 'E3', to: 'V4' },
  { key: 'V5' },
  { from: 'V3', key: 'E4', to: 'V5' }
];

let idx = 0;
let mode = 0;

export default function App() {
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');
  const graph = useMemo(
    () =>
      new DirectedGraph<string, unknown>({
        vertices: [{ key: 'V1' }]
      }),
    []
  );

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
          if ('from' in component) {
            graph.insertEdge(component as DirectedEdgeData<void>);
          } else {
            graph.insertVertex(component as VertexData<string>);
          }
          idx++;
        } else {
          if ('from' in component) {
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

  const handleVertexLongPress = useCallback<VertexPressHandler<string>>(
    ({ vertex: { key } }) => {
      console.log('long press', key);
    },
    []
  );

  const handleVertexPress = useCallback<VertexPressHandler<string>>(
    ({ vertex: { key } }) => {
      console.log('press', key);
      graph.focus(key);
    },
    [graph]
  );

  return (
    <GestureHandlerRootView style={styles.background}>
      <StatusBar
        backgroundColor='transparent'
        barStyle='light-content'
        translucent
      />
      <SafeAreaView style={styles.container}>
        <GraphView
          initialScale={1}
          objectFit={objectFit}
          padding={0}
          scales={[0.25, 1, 10]}>
          <DirectedGraphComponent
            renderers={{
              label: DefaultEdgeLabelRenderer
            }}
            settings={{
              events: {
                onVertexLongPress: handleVertexLongPress,
                onVertexPress: handleVertexPress
              },
              placement: {
                strategy: 'trees'
              }
            }}
            graph={graph}
          />
          <View style={styles.controls}>
            <GraphViewControls onObjectFitChange={setObjectFit} />
          </View>
        </GraphView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    top: 64,
    width: 32
  },
  background: {
    backgroundColor: 'black',
    flex: 1
  },
  container: {
    flex: 1,
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    right: 8,
    top: 16
  }
});
