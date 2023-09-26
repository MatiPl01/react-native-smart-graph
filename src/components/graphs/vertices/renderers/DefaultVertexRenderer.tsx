import { Circle, Group, useFont } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { VertexRendererProps } from '@/types/components';

export default function DefaultVertexRenderer<V>({
  animationProgress,
  focus: { progress: focusProgress },
  key,
  r
}: VertexRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, r);

  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  if (font === null) {
    return null;
  }

  return (
    <Group opacity={opacity} transform={transform}>
      <Circle color='gold' r={r} />
      <Circle color='black' r={0.75 * r} />
      <ResponsiveText
        color='white'
        font={font}
        horizontalAlignment='center'
        text={key}
        y={r}
      />
    </Group>
  );
}
