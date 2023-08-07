import { memo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { LabelComponentProps } from '@/types/components';

function LabelComponent<E>({
  edgeKey,
  height,
  renderer,
  v1Position,
  v2Position,
  ...restProps
}: LabelComponentProps<E>) {
  const edgeLength = useDerivedValue(() =>
    Math.sqrt(
      (v2Position.x.value - v1Position.x.value) ** 2 +
        (v2Position.y.value - v1Position.y.value) ** 2
    )
  );
  // Block swapping after making a swap
  // 0 - not blocked
  // 1 - blocked for top swap
  // -1 - blocked for bottom swap
  const blockedAngle = Math.PI / 36; // 5 degrees in one direction (10 degrees total)
  const swapBlocked = useSharedValue(0);
  const isSwapped = useSharedValue(false);
  const edgeRotation = useDerivedValue(() => {
    const {
      x: { value: x1 },
      y: { value: y1 }
    } = v1Position;
    const {
      x: { value: x2 },
      y: { value: y2 }
    } = v2Position;
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
    edgeLength,
    edgeRotation,
    height,
    key: edgeKey,
    ...restProps
  });
}

export default memo(LabelComponent) as typeof LabelComponent;
