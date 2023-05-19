import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import GraphEventsProvider from './context/graphEvents';

export default function App() {
  const graph = DirectedGraph.fromData(
    [
      { key: 'V1', data: 'V1' },
      { key: 'V2', data: 'V2' }
    ],
    [
      { from: 'V1', to: 'V2', key: 'E1', data: 'E1' },
      { from: 'V1', to: 'V2', key: 'E2', data: 'E2' },
      { from: 'V2', to: 'V1', key: 'E3', data: 'E3' }
    ]
  );

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <GraphEventsProvider
            onVertexPress={key => {
              console.log('vertex pressed', key);
            }}
            onVertexLongPress={key => {
              console.log('vertex long pressed', key);
            }}
            onEdgePress={key => {
              console.log('edge pressed', key);
            }}
            onEdgeLongPress={key => {
              console.log('edge long pressed', key);
            }}>
            <PannableScalableView objectFit='contain' controls>
              <DirectedGraphComponent
                graph={graph}
                settings={{
                  // TODO - fix orbits strategy padding
                  placement: {
                    strategy: 'circular',
                    minVertexSpacing: 100
                  },
                  components: {
                    edge: {
                      type: 'straight'
                    }
                  }
                }}
                renderers={{
                  edgeLabel: DefaultEdgeLabelRenderer
                }}
              />
            </PannableScalableView>
          </GraphEventsProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
