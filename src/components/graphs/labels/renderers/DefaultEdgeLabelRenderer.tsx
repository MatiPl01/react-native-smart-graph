import { Group, Text, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { DEFAULT_LABEL_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeLabelRendererProps } from '@/types/renderer';

export default function DefaultEdgeLabelRenderer<E>({
  animationProgress,
  centerX,
  centerY,
  edgeRotation,
  focusProgress,
  height,
  key
}: EdgeLabelRendererProps<E>) {
  const FONT_SIZE = 16;
  const font = useFont(FONTS.rubikFont, FONT_SIZE);

  const wrapperTransform = useDerivedValue(() => [
    { translateX: centerX.value },
    { translateY: centerY.value },
    { rotate: edgeRotation.value },
    { scale: height.value / FONT_SIZE }
  ]);
  // TODO - improve label centering
  const labelTransform = useDerivedValue(() => [
    {
      translateX: ((-key.length * FONT_SIZE) / 3.25) * animationProgress.value
    },
    { translateY: (FONT_SIZE / 3) * animationProgress.value },
    { scale: Math.max(animationProgress.value, 0) }
  ]);

  const opacity = useDerivedValue(() =>
    focusProgress.value >= 0 ? 1 : 1 + 0.75 * focusProgress.value
  );

  return (
    font && (
      <Group opacity={opacity} transform={wrapperTransform}>
        <Group transform={labelTransform}>
          <Text
            color={DEFAULT_LABEL_RENDERER_SETTINGS.fontColor}
            font={font}
            text={key}
            x={0}
            y={0}
          />
        </Group>
      </Group>
    )
  );
}
