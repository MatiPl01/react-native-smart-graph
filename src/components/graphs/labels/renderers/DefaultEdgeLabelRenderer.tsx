import { useDerivedValue } from 'react-native-reanimated';

import { Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { DEFAULT_LABEL_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeLabelRendererProps } from '@/types/renderer';

export default function DefaultEdgeLabelRenderer<E>({
  key,
  vertexRadius,
  edgeCenterPosition,
  edgeRotation,
  animationProgress
}: EdgeLabelRendererProps<E>) {
  const fontSize =
    vertexRadius * DEFAULT_LABEL_RENDERER_SETTINGS.font.sizeRatio;
  const font = useFont(FONTS.rubikFont, fontSize);

  const wrapperTransform = useDerivedValue(() => [
    { translateX: edgeCenterPosition.value.x },
    { translateY: edgeCenterPosition.value.y },
    { rotate: edgeRotation.value }
  ]);
  const labelTransform = useDerivedValue(() => [
    { translateX: ((-key.length * fontSize) / 4) * animationProgress.value },
    { translateY: (fontSize / 4) * animationProgress.value },
    { scale: animationProgress.value }
  ]);

  return (
    font && (
      <Group transform={wrapperTransform}>
        <Group transform={labelTransform}>
          <Text
            x={0}
            y={0}
            font={font}
            text={key}
            color={DEFAULT_LABEL_RENDERER_SETTINGS.font.color}
          />
        </Group>
      </Group>
    )
  );
}
