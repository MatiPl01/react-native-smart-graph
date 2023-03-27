import React from 'react';
import { SafeAreaView, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TestGraph from './components/graphs/TestGraph';
import PannableScalableView from './views/PannableScalableView';

function App() {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View style={{ height: height / 2 }} className='bg-slate-600'>
          <PannableScalableView className='w-20' controls>
            <TestGraph />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
