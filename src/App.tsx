import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TestGraph from './components/graphs/TestGraph';
import PannableScalableView from './views/PannableScalableView';

function App() {
  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='h-3/5 bg-gray-500'>
          <PannableScalableView objectFit='none' controls>
            <TestGraph />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
