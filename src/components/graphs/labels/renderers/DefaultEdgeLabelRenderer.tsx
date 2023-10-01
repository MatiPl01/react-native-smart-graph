import { Group, SkFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { ResponsiveText } from '@/components/text';
import { EdgeLabelRendererProps } from '@/types/components';

type CustomProps = {
  font: SkFont | null;
};

export default function DefaultEdgeLabelRenderer({
  animationProgress,
  customProps: { font },
  key,
  onMeasure // TODO: fix types - allow passing void instead of unknown if no value is specified
}: EdgeLabelRendererProps<unknown, CustomProps>) {
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
