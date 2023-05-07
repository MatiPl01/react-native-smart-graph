import { useDerivedValue } from 'react-native-reanimated';

import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { DEFAULT_VERTEX_RENDERER_SETTINGS } from '@/constants/renderers';
import { VertexRendererProps } from '@/types/renderer';

export default function DefaultVertexRenderer<V>({
  key,
  radius,
  position: { x, y },
  animationProgress
}: VertexRendererProps<V>) {
  const font = useFont(
    FONTS.rubikFont,
    radius * DEFAULT_VERTEX_RENDERER_SETTINGS.font.sizeRatio
  );
  const outerRadius = useDerivedValue(() => radius * animationProgress.value);
  const innerRadius = useDerivedValue(
    () =>
      radius *
      animationProgress.value *
      (1 - DEFAULT_VERTEX_RENDERER_SETTINGS.border.sizeRatio)
  );
  // TODO - fix text position (make centered)
  const textTransform = useDerivedValue(() => [
    { scale: animationProgress.value },
    { translateX: x.value },
    { translateY: y.value }
  ]);

  if (font === null) {
    return null;
  }

  return (
    <Group>
      <Circle
        cx={x}
        cy={y}
        r={outerRadius}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.border.color}
      />
      <Circle
        cx={x}
        cy={y}
        r={innerRadius}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.color}
      />
      <Group transform={textTransform}>
        <Text
          x={0}
          y={0}
          text={key}
          font={font}
          color={DEFAULT_VERTEX_RENDERER_SETTINGS.font.color}
        />
      </Group>
    </Group>
  );
}
