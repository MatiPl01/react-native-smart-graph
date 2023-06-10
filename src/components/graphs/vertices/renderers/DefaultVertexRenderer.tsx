import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { DEFAULT_VERTEX_RENDERER_SETTINGS } from '@/constants/renderers';
import { VertexRendererProps } from '@/types/renderer';

export default function DefaultVertexRenderer<V>({
  key,
  radius,
  scale,
  currentRadius,
  position: { x, y },
  animationProgress
}: VertexRendererProps<V>) {
  const font = useFont(
    FONTS.rubikFont,
    radius * DEFAULT_VERTEX_RENDERER_SETTINGS.font.sizeRatio
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
    { translateX: x.value - currentRadius.value },
    { translateY: y.value - currentRadius.value },
    { scale: Math.max(0, currentRadius.value / radius) }
  ]);

  if (font === null) {
    return null;
  }

  return (
    <Group transform={transform}>
      <Circle
        r={radius}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.border.color}
      />
      <Circle
        r={radius}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.color}
        transform={[
          { scale: 1 - DEFAULT_VERTEX_RENDERER_SETTINGS.border.sizeRatio }
        ]}
      />
      <Text
        x={0}
        y={0}
        text={key}
        font={font}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.font.color}
      />
    </Group>
  );
}
