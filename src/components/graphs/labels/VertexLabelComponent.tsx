import { Group } from '@shopify/react-native-skia';

import { VertexLabelComponentProps } from '@/types/components';

export default function VertexLabelComponent<V>({
  data: { animationProgress, focusProgress, transform, value },
  focusContext,
  renderer,
  vertexKey,
  vertexRadius
}: VertexLabelComponentProps<V>) {
  // TODO - check how many times it re-renders
  return (
    <Group transform={transform}>
      {renderer({
        animationProgress,
        focus: {
          key: focusContext.focus.key,
          progress: focusProgress
        },
        key: vertexKey,
        r: vertexRadius,
        value: value as V
      })}
    </Group>
  );
}
