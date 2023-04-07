import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';

import PannableScalableView from './views/PannableScalableView';

function App() {
  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='h-4/5 bg-gray-500'>
          <PannableScalableView objectFit='none' controls>
            <DirectedGraphComponent
              placementSettings={{
                strategy: 'orbits'
              }}
              vertices={[
                { key: 'A', data: [] },
                { key: 'B', data: [] },
                { key: 'C', data: [] },
                { key: 'E', data: [] },
                { key: 'F', data: [] },
                { key: 'D', data: [] },
                { key: 'G', data: [] },
                { key: 'H', data: [] },
                { key: 'I', data: [] },
                { key: 'J', data: [] },
                { key: 'K', data: [] },
                { key: 'L', data: [] }
              ]}
              edges={[
                { key: 'AB', from: 'A', to: 'B', data: [] },
                { key: 'AC', from: 'A', to: 'C', data: [] },
                { key: 'AD', from: 'A', to: 'D', data: [] },
                { key: 'BE', from: 'B', to: 'E', data: [] },
                { key: 'BF', from: 'B', to: 'F', data: [] },
                { key: 'BG', from: 'B', to: 'G', data: [] },
                { key: 'AH', from: 'A', to: 'H', data: [] },
                { key: 'AI', from: 'A', to: 'I', data: [] },
                { key: 'IJ', from: 'I', to: 'J', data: [] },
                { key: 'IK', from: 'I', to: 'K', data: [] },
                { key: 'IL', from: 'I', to: 'L', data: [] }
              ]}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
