import { Group } from '@shopify/react-native-skia';

import { VertexLabelComponentProps } from '@/types/components';

export default function VertexLabelComponent<V>({
  data: { animationProgress, transform, value },
  renderer,
  vertexKey,
  vertexRadius
}: VertexLabelComponentProps<V>) {
  return (
    <Group transform={transform}>
      {renderer({
        animationProgress,
        key: vertexKey,
        r: vertexRadius,
        value: value as V
      })}
    </Group>
  );
}
