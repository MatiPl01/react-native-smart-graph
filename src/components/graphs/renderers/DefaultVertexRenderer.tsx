import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { DEFAULT_VERTEX_RENDERER_SETTINGS } from '@/constants/renderers';
import { VertexRendererProps } from '@/types/renderer';

// TODO - improve default vertex renderers (styles)
export default function DefaultVertexRenderer<V>({
  key,
  radius,
  position: { x, y }
}: VertexRendererProps<V>) {
  const font = useFont(
    FONTS.rubikFont,
    radius * DEFAULT_VERTEX_RENDERER_SETTINGS.font.sizeRatio
  );

  if (font === null) {
    return null;
  }

  return (
    <Group>
      <Circle
        cx={x}
        cy={y}
        r={radius}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.border.color}
      />
      <Circle
        cx={x}
        cy={y}
        r={radius * (1 - DEFAULT_VERTEX_RENDERER_SETTINGS.border.sizeRatio)}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.color}
      />
      <Text
        x={x}
        y={y}
        text={key}
        font={font}
        color={DEFAULT_VERTEX_RENDERER_SETTINGS.font.color}
      />
    </Group>
  );
}
