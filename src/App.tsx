import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  Circle,
  Group,
  Line,
  Text,
  useFont,
  vec
} from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';

import PannableScalableView from './views/PannableScalableView';

export default function App() {
  const font = useFont(FONTS.rubikFont, 10);

  if (font === null) {
    return null;
  }

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='h-4/5 bg-black'>
          <PannableScalableView objectFit='cover' controls>
            <DirectedGraphComponent
              placementSettings={{
                strategy: 'orbits',
                vertexRadius: 5,
                minVertexSpacing: 10,
                layerSizing: 'equal'
              }}
              vertices={[
                { key: 'A', data: [] },
                { key: 'B', data: [] },
                { key: 'C', data: [] },
                { key: 'D', data: [] },
                { key: 'E', data: [] },
                { key: 'F', data: [] },
                { key: 'G', data: [] },
                { key: 'H', data: [] },
                { key: 'I', data: [] },
                { key: 'J', data: [] },
                { key: 'K', data: [] },
                { key: 'L', data: [] },
                { key: 'M', data: [] },
                { key: 'N', data: [] },
                { key: 'O', data: [] },
                { key: 'P', data: [] },
                { key: 'Q', data: [] },
                { key: 'R', data: [] },
                { key: 'S', data: [] },
                { key: 'T', data: [] }
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
                { key: 'IL', from: 'I', to: 'L', data: [] },
                { key: 'IM', from: 'I', to: 'M', data: [] },
                { key: 'IN', from: 'I', to: 'N', data: [] },
                { key: 'NO', from: 'N', to: 'O', data: [] },
                { key: 'JP', from: 'J', to: 'P', data: [] },
                { key: 'OQ', from: 'O', to: 'Q', data: [] },
                { key: 'OR', from: 'O', to: 'R', data: [] },
                { key: 'OS', from: 'O', to: 'S', data: [] },
                { key: 'ST', from: 'S', to: 'T', data: [] }
              ]}
              // eslint-disable-next-line react/no-unstable-nested-components
              vertexRenderer={({ key, radius, position: { x, y } }) => (
                <Group>
                  <Circle cx={x} cy={y} r={radius} color='brown' />
                  <Circle cx={x} cy={y} r={radius * 0.75} color='green' />
                  <Text x={x} y={y} text={key} font={font} color='white' />
                </Group>
              )}
              // eslint-disable-next-line react/no-unstable-nested-components
              edgeRenderer={({
                key,
                from: { x: x1, y: y1 },
                to: { x: x2, y: y2 }
              }) => (
                <Line
                  key={key}
                  p1={vec(x1, y1)}
                  p2={vec(x2, y2)}
                  color='lightblue'
                  style='stroke'
                  strokeWidth={1}
                />
              )}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
