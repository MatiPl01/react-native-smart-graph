import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { VertexRendererProps } from '@/types/render';

// TODO - improve default vertex renderer (change styles)
export default function DefaultVertexRenderer<V>({
  key,
  radius,
  position: { x, y }
}: VertexRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, radius * 2);

  if (font === null) {
    return null;
  }

  return (
    <Group>
      <Circle cx={x} cy={y} r={radius} color='gold' />
      <Circle cx={x} cy={y} r={radius * 0.75} color='black' />
      <Text x={x} y={y} text={key} font={font} color='white' />
    </Group>
  );
}
