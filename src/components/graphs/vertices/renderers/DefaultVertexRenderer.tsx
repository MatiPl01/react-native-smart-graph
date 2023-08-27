/* eslint-disable import/no-unused-modules */
import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { VertexRendererProps } from '@/types/components';

export default function DefaultVertexRenderer<V>({
  animationProgress,
  focusProgress,
  key
}: VertexRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, 20);

  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  if (font === null) {
    return null;
  }

  return (
    <Group opacity={opacity} origin={{ x: 20, y: 20 }} transform={transform}>
      <Circle color='gold' r={20} />
      <Circle color='black' r={15} />
      <Text color='white' font={font} text={key} x={-10} y={40} />
    </Group>
  );
}
