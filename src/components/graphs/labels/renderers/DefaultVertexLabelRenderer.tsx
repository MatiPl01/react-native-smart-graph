import { Group } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import ResponsiveText from 'react-native-skia-responsive-text';

import FONT from '@/font';
import { VertexLabelRendererProps } from '@/types/components';

export default function DefaultVertexLabelRenderer<V>({
  animationProgress,
  focus: { progress: focusProgress },
  key,
  onMeasure
}: VertexLabelRendererProps<V>) {
  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    <Group opacity={focusProgress} transform={transform}>
      <ResponsiveText
        color='white'
        font={FONT.regular}
        text={key}
        onMeasure={onMeasure}
      />
    </Group>
  );
}
