import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';

import DefaultEdgeLabelRenderer from './components/graphs/renderers/DefaultEdgeLabelRenderer';
import PannableScalableView from './views/PannableScalableView';

export default function App() {
  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='cover' controls>
            <DirectedGraphComponent
              vertices={[
                { key: 'A', data: [] },
                { key: 'B', data: [] },
                { key: 'C', data: [] },
                { key: 'D', data: [] }
              ]}
              edges={[
                { key: 'AB', from: 'A', to: 'B', data: [] },
                { key: 'AC', from: 'A', to: 'C', data: [] },
                { key: 'AD', from: 'A', to: 'D', data: [] }
              ]}
              settings={{
                // TODO - fix orbits strategy padding
                placement: {
                  strategy: 'circular',
                  layerSizing: 'equal',
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
