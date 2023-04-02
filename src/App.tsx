import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import PannableScalableView from './views/PannableScalableView';
import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';

function App() {
  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='h-3/5 bg-gray-500'>
          <PannableScalableView objectFit='none' controls>
            <DirectedGraphComponent vertices={[
              { key: 'A', data: [] },
              { key: 'B', data: [] },
              { key: 'C', data: [] },
              { key: 'D', data: [] }
            ]} edges={[
              { key: 'AB', from: 'A', to: 'B', data: [] },
              { key: 'AC', from: 'A', to: 'C', data: [] },
              { key: 'AD', from: 'A', to: 'D', data: [] }
            ]} />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
