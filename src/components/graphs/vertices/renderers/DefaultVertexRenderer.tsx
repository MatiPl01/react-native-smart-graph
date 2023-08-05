import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';
import {
  interpolate,
  useAnimatedReaction,
  useDerivedValue
} from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { VertexRendererProps } from '@/types/renderers';

export default function DefaultVertexRenderer<V>({
  animationProgress,
  currentRadius,
  focusProgress,
  key,
  position: { x, y },
  radius,
  scale
}: VertexRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, 2 * radius);

  useAnimatedReaction(
    () => ({
      currentProgress: animationProgress.value,
      currentScale: scale.value
    }),
    ({ currentProgress, currentScale }) => {
      currentRadius.value = currentProgress * currentScale * radius;
    }
  );

  const transform = useDerivedValue(() => [
    { translateX: x.value },
    { translateY: y.value },
    { scale: Math.max(0, currentRadius.value / radius) }
  ]);

  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  if (font === null) {
    return null;
  }

  return (
    <Group opacity={opacity} transform={transform}>
      <Circle color='gold' r={radius} />
      <Circle color='black' r={0.75 * radius} />
      <Text color='white' font={font} text={key} x={0} y={0} />
    </Group>
  );
}
