import React from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TestGraph from './components/graphs/TestGraph';
import PannableScalableView from './views/PannableScalableView';

function App() {
  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <PannableScalableView>
          <TestGraph />
        </PannableScalableView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
