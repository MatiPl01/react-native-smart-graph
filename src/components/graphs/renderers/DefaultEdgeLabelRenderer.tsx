import { useDerivedValue } from 'react-native-reanimated';

import { Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { DEFAULT_LABEL_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeLabelRendererProps } from '@/types/renderer';

export default function DefaultEdgeLabelRenderer<E>({
  key,
  vertexRadius,
  edgeCenterPosition,
  edgeRotation
}: EdgeLabelRendererProps<E>) {
  const fontSize =
    vertexRadius * DEFAULT_LABEL_RENDERER_SETTINGS.font.sizeRatio;
  const font = useFont(FONTS.rubikFont, fontSize);

  const transform = useDerivedValue(
    () => [
      { translateX: edgeCenterPosition.value.x },
      { translateY: edgeCenterPosition.value.y },
      { rotate: edgeRotation.value }
    ],
    [edgeCenterPosition, edgeRotation]
  );

  return (
    font && (
      <Group transform={transform}>
        <Text
          x={(-key.length * fontSize) / 4}
          y={fontSize / 4}
          font={font}
          text={key}
          color={DEFAULT_LABEL_RENDERER_SETTINGS.font.color}
        />
      </Group>
    )
  );
}
