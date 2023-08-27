/* eslint-disable import/no-unused-modules */
import { Group, Text, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { LabelRendererProps } from '@/types/components';

export default function DefaultLabelRenderer<E>({
  animationProgress,
  key
}: LabelRendererProps<E>) {
  const FONT_SIZE = 20;
  const font = useFont(FONTS.rubikFont, FONT_SIZE);

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
      <Group transform={labelTransform}>
        <Text color='white' font={font} text={key} x={0} y={0} />
      </Group>
    )
  );
}
