/* eslint-disable import/no-unused-modules */
import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { UndirectedCurvedEdgeComponentProps } from '@/types/components';
import { animateToValue } from '@/utils/animations';
import {
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import RenderedCurvedEdgeComponent from './RenderedCurvedEdgeComponent';

function UndirectedCurvedEdgeComponent<V, E>({
  data: {
    animationProgress,
    animationSettings,
    edgesCount,
    key,
    labelHeight,
    labelPosition,
    order,
    v1Key,
    v1Position: { x: v1x, y: v1y },
    v1Radius,
    v2Key,
    v2Position: { x: v2x, y: v2y },
    v2Radius,
    value
  },
  renderers,
  settings
}: UndirectedCurvedEdgeComponentProps<V, E>) {
  const animated = !!animationSettings;
  const {
    label: { scale: labelScale }
  } = settings;

  // Edge
  const targetOffset = useDerivedValue(
    () => labelHeight.value * (order.value - (edgesCount.value - 1) / 2)
  );
  const currentOffset = useSharedValue(
    labelHeight.value * (order.value - (edgesCount.value - 1) / 2)
  );
  const path = useSharedValue('');

  // Edge label
  useAnimatedReaction(
    () => ({
      r1: v1Radius.value,
      r2: v2Radius.value,
      scale: labelScale.value
    }),
    ({ r1, r2, scale }) => {
      labelHeight.value = ((r1 + r2) / 2) * scale;
    }
  );

  // Edge offset
  useAnimatedReaction(
    () => ({
      current: currentOffset.value,
      target: targetOffset.value
    }),
    ({ current, target }) => {
      currentOffset.value = animated
        ? animateToValue(current, target, 0.1, 100)
        : target;
    }
  );

  // Edge
  useAnimatedReaction(
    () => ({
      offset: currentOffset.value,
      v1: { x: v1x.value, y: v1y.value },
      v2: { x: v2x.value, y: v2y.value }
    }),
    ({ offset, v1, v2 }) => {
      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first in the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        [v1, v2] = [v2, v1];
      }
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(v1, v2);
      const { x: parabolaX, y: parabolaY } = translateAlongVector(
        {
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2
        },
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX;
      labelPosition.y.value = parabolaY;

      // Update the edge path
      const controlPoint = {
        x: parabolaX * 2 - (v1.x + v2.x) / 2,
        y: parabolaY * 2 - (v1.y + v2.y) / 2
      };
      path.value = `M${v1.x},${v1.y} Q${controlPoint.x},${controlPoint.y} ${v2.x},${v2.y}`;
    }
  );

  return (
    <RenderedCurvedEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      path={path}
      renderer={renderers.edge}
      value={value}
    />
  );
}

export default memo(
  UndirectedCurvedEdgeComponent
) as typeof UndirectedCurvedEdgeComponent;
