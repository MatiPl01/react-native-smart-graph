import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

// TODO - remove this after testing
const ADDED_COMPONENTS: Array<{
  key: string;
  data: string;
  from?: string;
  to?: string;
}> = [];

// Create 10 vertices in a loop and after adding a new vertex to the array
// join this vertex with all previously added vertices
for (let i = 0; i < 10; i++) {
  ADDED_COMPONENTS.push({
    key: `V${i}`,
    data: `V${i}`
  });
  for (let j = 0; j < i; j++) {
    ADDED_COMPONENTS.push({
      from: `V${i}`,
      to: `V${j}`,
      key: `E${i}${j}`,
      data: `E${i}${j}`
    });
  }
}

let idx = 0;
let mode = 0;

export default function App() {
  const graph = new DirectedGraph();
  // TODO - remove this useEffect after testing
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
            graph.insertEdge(
              component.from,
              component.to,
              component.key,
              component.data
            );
          } else {
            graph.insertVertex(component.key, component.data);
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
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='contain' controls>
            <DirectedGraphComponent
              graph={graph}
              settings={{
                // TODO - fix orbits strategy padding
                placement: {
                  strategy: 'circular',
                  minVertexSpacing: 100
                }
              }}
              renderers={{
                edgeLabel: DefaultEdgeLabelRenderer
              }}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
