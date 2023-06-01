import { Group, Text, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { DEFAULT_LABEL_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeLabelRendererProps } from '@/types/renderer';

export default function DefaultEdgeLabelRenderer<E>({
  key,
  centerPosition,
  height,
  edgeRotation,
  animationProgress
}: EdgeLabelRendererProps<E>) {
  const FONT_SIZE = 16;
  const font = useFont(FONTS.rubikFont, FONT_SIZE);

  const wrapperTransform = useDerivedValue(() => [
    { translateX: centerPosition.value.x },
    { translateY: centerPosition.value.y },
    { rotate: edgeRotation.value },
    { scale: height.value / FONT_SIZE }
  ]);
  // TODO - improve label centering
  const labelTransform = useDerivedValue(() => [
    {
      translateX: ((-key.length * FONT_SIZE) / 3.25) * animationProgress.value
    },
    { translateY: (FONT_SIZE / 3) * animationProgress.value },
    { scale: animationProgress.value }
  ]);

  return (
    font && (
      <Group transform={wrapperTransform}>
        <Group transform={labelTransform}>
          <Text
            x={0}
            y={0}
            font={font}
            text={key}
            color={DEFAULT_LABEL_RENDERER_SETTINGS.fontColor}
          />
        </Group>
      </Group>
    )
  );
}
