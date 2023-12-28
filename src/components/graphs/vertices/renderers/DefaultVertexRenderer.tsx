import { Circle, Group } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import { VertexRendererProps } from '@/types/components';

export default function DefaultVertexRenderer<V>({
  animationProgress,
  focus: { progress: focusProgress },
  r
}: VertexRendererProps<V>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    <Group opacity={opacity} transform={transform}>
      <Circle color='gold' r={r} />
      <Circle color='black' r={0.75 * r} />
    </Group>
  );
}
