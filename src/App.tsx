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
          <PannableScalableView objectFit='contain' controls>
            <DirectedGraphComponent
              placementSettings={{
                strategy: 'tree'
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
                { key: 'L', data: [] },
                { key: 'M', data: [] },
                { key: 'N', data: [] },
                { key: 'O', data: [] }
              ]}
              edges={[
                { key: 'AB', from: 'A', to: 'B', data: [] },
                { key: 'BC', from: 'B', to: 'C', data: [] },
                { key: 'CD', from: 'C', to: 'D', data: [] },
                { key: 'CE', from: 'C', to: 'E', data: [] },
                { key: 'CM', from: 'C', to: 'M', data: [] },
                { key: 'EF', from: 'E', to: 'F', data: [] },
                { key: 'FG', from: 'F', to: 'G', data: [] },
                { key: 'FH', from: 'F', to: 'H', data: [] },
                { key: 'BI', from: 'B', to: 'I', data: [] },
                { key: 'IJ', from: 'I', to: 'J', data: [] },
                { key: 'JK', from: 'J', to: 'K', data: [] },
                { key: 'JL', from: 'J', to: 'L', data: [] },
                { key: 'KN', from: 'K', to: 'N', data: [] },
                { key: 'KO', from: 'K', to: 'O', data: [] }
              ]}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
