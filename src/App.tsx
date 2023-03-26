import React from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Circle, Group } from '@shopify/react-native-skia';

import PannableCanvasView from './views/PannableCanvasView';

function App() {
  const size = 256;
  const r = useSharedValue(100);
  const c = useDerivedValue(() => size - r.value);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <PannableCanvasView>
          <Group blendMode='multiply'>
            <Circle cx={r} cy={r} r={r} color='cyan' />
            <Circle cx={c} cy={r} r={r} color='magenta' />
            <Circle cx={size / 2} cy={c} r={r} color='yellow' />
          </Group>
        </PannableCanvasView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
