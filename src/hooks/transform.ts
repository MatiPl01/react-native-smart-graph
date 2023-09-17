import { useDerivedValue } from 'react-native-reanimated';

import { VertexComponentData } from '@/types/data';
import { calcValueOnProgress } from '@/utils/views';

export function useVertexTransform<V>({
  points,
  scale,
  transformProgress
}: VertexComponentData<V>) {
  return useDerivedValue(() => {
    const s = Math.max(0, scale.value);
    const progress = transformProgress.value;
    const { source, target } = points.value;
    return [
      { scale: s },
      ...(s > 0
        ? [
            {
              translateX: calcValueOnProgress(progress, source.x, target.x) / s
            },
            {
              translateY: calcValueOnProgress(progress, source.y, target.y) / s
            }
          ]
        : [])
    ];
  });
}
