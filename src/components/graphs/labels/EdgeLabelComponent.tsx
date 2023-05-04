import { useDerivedValue } from 'react-native-reanimated';

import { Edge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { EdgeLabelRendererFunction } from '@/types/renderer';

type EdgeLabelComponentProps<E, V> = {
  edge: Edge<E, V>;
  vertexRadius: number;
  verticesPositions: Record<string, AnimatedVectorCoordinates>;
  renderer: EdgeLabelRendererFunction<E>;
};

export default function EdgeLabelComponent<E, V>({
  edge,
  vertexRadius,
  verticesPositions,
  renderer
}: EdgeLabelComponentProps<E, V>) {
  const [{ key: key1 }, { key: key2 }] = edge.vertices;
  const { x: x1, y: y1 } = verticesPositions[key1] as AnimatedVectorCoordinates;
  const { x: x2, y: y2 } = verticesPositions[key2] as AnimatedVectorCoordinates;

  const edgeCenterPosition = useDerivedValue(
    () => ({
      x: (x1.value + x2.value) / 2,
      y: (y1.value + y2.value) / 2
    }),
    [x1, x2, y1, y2]
  );

  const edgeLength = useDerivedValue(
    () => Math.sqrt((x2.value - x1.value) ** 2 + (y2.value - y1.value) ** 2),
    [x1, x2, y1, y2]
  );

  const edgeRotation = useDerivedValue(() => {
    const angle = Math.atan2(y2.value - y1.value, x2.value - x1.value);
    if (-Math.PI / 2 < angle && angle < Math.PI / 2) {
      return angle;
    }
    return angle - Math.PI;
  }, [x1, x2, y1, y2]);

  return renderer({
    key: edge.key,
    data: edge.value,
    vertexRadius,
    edgeCenterPosition,
    edgeLength,
    edgeRotation
  });
}
