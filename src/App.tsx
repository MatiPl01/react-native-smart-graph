import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

// TODO - remove this after testing
const ADDED_COMPONENTS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
  // .slice(0, 5)
  .map(key => ({
    key,
    data: key
  }));

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
      const component = ADDED_COMPONENTS[idx];
      if (!component) {
        return;
      }

      try {
        if (mode === 0) {
          graph.insertVertex(component.key, component.data);
          idx++;
        } else {
          graph.removeVertex(component.key);
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
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='contain' maxScale={1} controls>
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
