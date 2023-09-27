import { Group, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { VertexLabelRendererProps } from '@/types/components';

export default function DefaultVertexLabelRenderer<V>({
  animationProgress,
  focus: { progress: focusProgress },
  key,
  r
}: VertexLabelRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, r);

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    font && (
      <Group opacity={focusProgress} transform={transform}>
        <ResponsiveText
          color='white'
          font={font}
          horizontalAlignment='center'
          text={key}
          width={4 * r}
          x={-2 * r}
        />
      </Group>
    )
  );
}
