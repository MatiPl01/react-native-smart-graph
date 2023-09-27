import { Group, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { EdgeLabelRendererProps } from '@/types/components';

export default function DefaultEdgeLabelRenderer<E>({
  animationProgress,
  key,
  onMeasure,
  r
}: EdgeLabelRendererProps<E>) {
  const font = useFont(FONTS.rubikFont, r);

  const labelTransform = useDerivedValue(() => [
    { scale: Math.max(animationProgress.value, 0) }
  ]);

  return (
    font && (
      <Group transform={labelTransform}>
        <ResponsiveText
          color='white'
          font={font}
          text={key}
          onMeasure={onMeasure}
        />
      </Group>
    )
  );
}
