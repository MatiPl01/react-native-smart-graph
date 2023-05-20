import {
  SharedValue,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { Edge } from '@/types/graphs';
import { AnimatedVector } from '@/types/layout';
import {
  EdgeLabelRendererFunction,
  SharedRenderersProps
} from '@/types/renderer';

type EdgeLabelComponentProps<E, V> = SharedRenderersProps & {
  edge: Edge<E, V>;
  p1: AnimatedVector;
  p2: AnimatedVector;
  vertexRadius: number;
  centerPosition: AnimatedVector;
  maxSize: SharedValue<number>;
  renderer: EdgeLabelRendererFunction<E>;
};

export default function EdgeLabelComponent<E, V>({
  edge,
  p1,
  p2,
  centerPosition,
  maxSize,
  renderer,
  ...restProps
}: EdgeLabelComponentProps<E, V>) {
  const edgeLength = useDerivedValue(() =>
    Math.sqrt((p2.value.x - p1.value.x) ** 2 + (p2.value.y - p1.value.y) ** 2)
  );
  // Block swapping after making a swap
  // 0 - not blocked
  // 1 - blocked for top swap
  // -1 - blocked for bottom swap
  const blockedAngle = Math.PI / 36; // 5 degrees in one direction (10 degrees total)
  const swapBlocked = useSharedValue(0);
  const isSwapped = useSharedValue(false);
  const edgeRotation = useDerivedValue(() => {
    const { x: x1, y: y1 } = p1.value;
    const { x: x2, y: y2 } = p2.value;
    const angle = Math.atan2(y2 - y1, x2 - x1);

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
  });

  return renderer({
    key: edge.key,
    data: edge.value,
    centerPosition,
    maxSize,
    edgeRotation,
    edgeLength,
    ...restProps
  });
}
