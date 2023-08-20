/* eslint-disable import/no-unused-modules */
import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { UndirectedCurvedEdgeComponentProps } from '@/types/components';
import {
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import RenderedCurvedEdgeComponent from './RenderedCurvedEdgeComponent';

function UndirectedCurvedEdgeComponent<V, E>({
  animatedEdgesCount,
  animatedOrder,
  data: {
    animationProgress,
    key,
    labelHeight,
    labelPosition,
    v1Key,
    v1Position,
    v1Radius,
    v2Key,
    v2Position,
    v2Radius,
    value
  },
  renderers,
  settings
}: UndirectedCurvedEdgeComponentProps<V, E>) {
  const p1 = useDerivedValue(() => ({
    x: v1Position.x.value,
    y: v1Position.y.value
  }));
  const p2 = useDerivedValue(() => ({
    x: v2Position.x.value,
    y: v2Position.y.value
  }));

  // Parabola vertex
  const parabolaX = useSharedValue(
    (v1Position.x.value + v2Position.x.value) / 2
  );
  const parabolaY = useSharedValue(
    (v1Position.y.value + v2Position.y.value) / 2
  );

  // Edge label
  useAnimatedReaction(
    () =>
      settings.label
        ? {
            r1: v1Radius.value,
            r2: v2Radius.value,
            scale: settings.label.scale.value
          }
        : null,
    data => {
      if (!data) return;
      const { r1, r2, scale } = data;
      labelHeight.value = ((r1 + r2) / 2) * scale;
    }
  );

  useAnimatedReaction(
    () => ({
      offset:
        labelHeight.value *
        (animatedOrder.value - (animatedEdgesCount.value - 1) / 2),
      v1: p1.value,
      v2: p2.value
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
      const { x, y } = translateAlongVector(
        {
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2
        },
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX.value = x;
      labelPosition.y.value = parabolaY.value = y;
    }
  );

  // Edge curve path
  const path = useDerivedValue(() => {
    const controlPoint = {
      x: parabolaX.value * 2 - (v1Position.x.value + v2Position.x.value) / 2,
      y: parabolaY.value * 2 - (v1Position.y.value + v2Position.y.value) / 2
    };

    // Create the SVG path string with the 'Q' command for a quadratic curve
    return `M${v1Position.x.value},${v1Position.y.value} Q${controlPoint.x},${controlPoint.y} ${v2Position.x.value},${v2Position.y.value}`;
  });

  return (
    <RenderedCurvedEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      parabolaX={parabolaX}
      parabolaY={parabolaY}
      path={path}
      renderer={renderers.edge}
      value={value}
    />
  );
}

export default memo(
  UndirectedCurvedEdgeComponent
) as typeof UndirectedCurvedEdgeComponent;
