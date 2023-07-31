import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';
import {
  interpolate,
  useAnimatedReaction,
  useDerivedValue
} from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { DEFAULT_VERTEX_RENDERER_SETTINGS } from '@/constants/renderers';
import { VertexRendererProps } from '@/types/renderer';

export default function DefaultVertexRenderer<V>({
  animationProgress,
  currentRadius,
  key,
  position: { x, y },
  radius,
  scale,
  transitionProgress
}: VertexRendererProps<V>) {
  const font = useFont(
    FONTS.rubikFont,
    radius * DEFAULT_VERTEX_RENDERER_SETTINGS.font.scale
  );

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
    interpolate(transitionProgress.value, [0, 1], [0.5, 1])
  );

  if (font === null) {
    return null;
  }

  return (
    <Group opacity={opacity} transform={transform}>
      <Circle
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.border.color}
        r={radius}
      />
      <Circle
        transform={[
          { scale: 1 - DEFAULT_VERTEX_RENDERER_SETTINGS.border.scale }
        ]}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.color}
        r={radius}
      />
      <Text
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.font.color}
        font={font}
        text={key}
        x={0}
        y={0}
      />
    </Group>
  );
}
