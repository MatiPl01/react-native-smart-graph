import { Group, Text, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { EdgeLabelRendererProps } from '@/types/components';

export default function DefaultEdgeLabelRenderer<E>({
  animationProgress,
  key,
  r
}: EdgeLabelRendererProps<E>) {
  const font = useFont(FONTS.rubikFont, r);

  // TODO - improve label centering
  const labelTransform = useDerivedValue(() => [
    { translateX: ((-key.length * r) / 3.25) * animationProgress.value },
    { translateY: (r / 3) * animationProgress.value },
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
