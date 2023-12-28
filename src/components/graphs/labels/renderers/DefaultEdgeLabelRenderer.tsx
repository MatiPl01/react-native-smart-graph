import { Group } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import ResponsiveText from 'react-native-skia-responsive-text';

import FONT from '@/font';
import { EdgeLabelRendererProps } from '@/types/components';

export default function DefaultEdgeLabelRenderer({
  animationProgress,
  key,
  onMeasure
}: EdgeLabelRendererProps) {
  const labelTransform = useDerivedValue(() => [
    { scale: Math.max(animationProgress.value, 0) }
  ]);

  return (
    <Group transform={labelTransform}>
      <ResponsiveText
        color='white'
        font={FONT.regular}
        text={key}
        onMeasure={onMeasure}
      />
    </Group>
  );
}
