import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Edge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  EdgeLabelRendererFunction,
  SharedRenderersProps
} from '@/types/renderer';

type EdgeLabelComponentProps<E, V> = SharedRenderersProps & {
  edge: Edge<E, V>;
  vertexRadius: number;
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  renderer: EdgeLabelRendererFunction<E>;
};

export default function EdgeLabelComponent<E, V>({
  edge,
  v1Position,
  v2Position,
  renderer,
  ...restProps
}: EdgeLabelComponentProps<E, V>) {
  const { x: x1, y: y1 } = v1Position;
  const { x: x2, y: y2 } = v2Position;

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

  // Block swapping after making a swap
  // 0 - not blocked
  // 1 - blocked for top swap
  // -1 - blocked for bottom swap
  const blockedAngle = Math.PI / 36; // 5 degrees in one direction (10 degrees total)
  const swapBlocked = useSharedValue(0);
  const isSwapped = useSharedValue(false);
  const edgeRotation = useDerivedValue(() => {
    const angle = Math.atan2(y2.value - y1.value, x2.value - x1.value);

    if (!swapBlocked.value) {
      if (angle < -Math.PI / 2 || Math.PI / 2 < angle) {
        // Block swapping after making a swap
        if (!isSwapped.value) {
          swapBlocked.value = angle < 0 ? 1 : -1;
          isSwapped.value = true;
        }
      } else {
        // Block swapping after making a swap
        // eslint-disable-next-line no-lonely-if
        if (isSwapped.value) {
          swapBlocked.value = angle < 0 ? 1 : -1;
          isSwapped.value = false;
        }
      }
      // Unblock swapping if angle is out of blocking range
    } else if (
      (swapBlocked.value === 1 &&
        Math.abs(angle + Math.PI / 2) > blockedAngle) ||
      (swapBlocked.value === -1 && Math.abs(angle - Math.PI / 2) > blockedAngle)
    ) {
      swapBlocked.value = 0;
    }

    if (isSwapped.value) {
      return angle - Math.PI;
    }
    return angle;
  }, [x1, x2, y1, y2]);

  return renderer({
    key: edge.key,
    data: edge.value,
    edgeCenterPosition,
    edgeLength,
    edgeRotation,
    ...restProps
  });
}
