import { Group, Transforms2d } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { LabelComponentProps } from '@/types/components';
import { distanceBetweenVectors } from '@/utils/vectors';

function LabelComponent<E>({
  data: { animationProgress, transform: labelTransform, value },
  edgeKey,
  renderer,
  ...restProps
}: LabelComponentProps<E>) {
  // RENDERER PROPS
  const edgeLength = useSharedValue(0);
  const edgeRotation = useSharedValue(0);

  // HELPER VALUES
  const transform = useSharedValue<Transforms2d>([{ scale: 0 }]);

  // Block swapping after making a swap
  // 0 - not blocked
  // 1 - blocked for top swap
  // -1 - blocked for bottom swap
  const blockedAngle = Math.PI / 36; // 5 degrees in one direction (10 degrees in total)
  const swapBlocked = useSharedValue(0);
  const isSwapped = useSharedValue(false);

  useAnimatedReaction(
    () => labelTransform.value,
    ({ center, p1, p2, scale }) => {
      const { x: x1, y: y1 } = p1;
      const { x: x2, y: y2 } = p2;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      let rotation: number;

      // Handle label rotation
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
        (swapBlocked.value === -1 &&
          Math.abs(angle - Math.PI / 2) > blockedAngle)
      ) {
        swapBlocked.value = 0;
      }

      if (isSwapped.value) {
        rotation = angle - Math.PI;
      } else {
        rotation = angle;
      }

      // Update label transform
      transform.value = [
        { translateX: center.x },
        { translateY: center.y },
        { rotate: rotation },
        { scale }
      ];
      // Update renderer props
      edgeLength.value = distanceBetweenVectors(p1, p2);
      edgeRotation.value = rotation;
    }
  );

  return (
    <Group transform={transform}>
      {renderer({
        ...restProps,
        animationProgress,
        edgeLength,
        edgeRotation,
        key: edgeKey,
        value
      })}
    </Group>
  );
}

export default memo(LabelComponent) as typeof LabelComponent;
