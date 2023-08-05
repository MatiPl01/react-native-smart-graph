import { Group, Text, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { EdgeLabelRendererProps } from '@/types/renderers';

export default function DefaultEdgeLabelRenderer<E>({
  animationProgress,
  centerX,
  centerY,
  edgeRotation,
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

  return (
    font && (
      <Group transform={wrapperTransform}>
        <Group transform={labelTransform}>
          <Text color='white' font={font} text={key} x={0} y={0} />
        </Group>
      </Group>
    )
  );
}
