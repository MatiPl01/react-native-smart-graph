import { Group, SkFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { ResponsiveText } from '@/components/text';
import { VertexLabelRendererProps } from '@/types/components';

type CustomProps = {
  font: SkFont | null;
};

export default function DefaultVertexLabelRenderer<V>({
  animationProgress,
  customProps: { font },
  focus: { progress: focusProgress },
  key,
  onMeasure
}: VertexLabelRendererProps<V, CustomProps>) {
  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    font && (
      <Group opacity={focusProgress} transform={transform}>
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
