/* eslint-disable import/no-unused-modules */
import { rotate } from '@shopify/react-native-skia';
import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedCurvedEdgeComponentProps } from '@/types/components';
import { animateToValue } from '@/utils/animations';
import { calcApproxPointOnParabola } from '@/utils/math';
import {
  calcOrthogonalUnitVector,
  calcUnitVector,
  distanceBetweenVectors,
  translateAlongVector
} from '@/utils/vectors';

import RenderedCurvedEdgeComponent from './CurvedEdgeComponent';

function DirectedCurvedEdgeComponent<V, E>({
  data: {
    animationProgress,
    animationSettings,
    edgesCount,
    key,
    labelHeight,
    labelPosition,
    order,
    v1Position: { x: v1x, y: v1y },
    v1Radius,
    v2Position: { x: v2x, y: v2y },
    v2Radius,
    value
  },
  renderers,
  settings
}: DirectedCurvedEdgeComponentProps<V, E>) {
  const animated = !!animationSettings;
  const {
    arrow: { scale: arrowScale },
    label: { scale: labelScale }
  } = settings;

  // Edge arrow
  const arrowHeight = useSharedValue(0);
  const arrowWidth = useSharedValue(0);
  const arrowTipPosition = useSharedValue({ x: 0, y: 0 });
  const dirVec = useSharedValue({ x: 0, y: 0 });
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
      r2: v2Radius.value,
      v1: { x: v1x.value, y: v1y.value },
      v2: { x: v2x.value, y: v2y.value }
    }),
    ({ offset, r2, v1, v2 }) => {
      const center = {
        x: (v1.x + v2.x) / 2,
        y: (v1.y + v2.y) / 2
      };

      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(v1, v2);
      const { x: parabolaX, y: parabolaY } = translateAlongVector(
        center,
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX;
      labelPosition.y.value = parabolaY;

      // Calculate the edge arrow tip position and direction vector
      // If points are collinear
      if (v1.x === parabolaX || v1.y === parabolaY) {
        // 1. Calculate the direction vector
        const directionVector = calcUnitVector(v2, v1);
        dirVec.value = directionVector;
        // 2. Calculate the arrow tip position
        const tipPosition = translateAlongVector(v2, directionVector, r2);
        arrowTipPosition.value = tipPosition;
      }
      // Otherwise, if points are not collinear
      else {
        // 1. Get the rotation angle of the coordinate system
        const rotationAngle = Math.atan2(v2.y - v1.y, v2.x - v1.x);
        // 2. Rotate points to the new coordinate system
        const plainP2 = rotate(v2, center, rotationAngle);
        const plainParabolaVertex = rotate(
          { x: parabolaX, y: parabolaY },
          center,
          rotationAngle
        );
        // 3. Calculate the canonical parabola equation coefficients
        const { x: p, y: q } = plainParabolaVertex;
        const a = (plainP2.y - q) / (plainP2.x - p) ** 2;
        // 4. Calculate the edge arrow tip position
        const plainArrowTipPosition = calcApproxPointOnParabola(
          plainP2.x,
          a,
          p,
          q,
          -r2
        );
        const rotatedArrowTipPosition = rotate(
          plainArrowTipPosition,
          center,
          -rotationAngle
        );
        // 5. Calculate the direction vector
        const plainArrowEndPosition = calcApproxPointOnParabola(
          plainArrowTipPosition.x,
          a,
          p,
          q,
          -arrowHeight.value
        );
        const rotatedArrowEndPosition = rotate(
          plainArrowEndPosition,
          center,
          -rotationAngle
        );
        const directionVector = calcUnitVector(
          rotatedArrowTipPosition,
          rotatedArrowEndPosition
        );
        // 6. Update the values
        arrowTipPosition.value = rotatedArrowTipPosition;
        dirVec.value = directionVector;
      }

      // Update the edge path
      const controlPoint = {
        x: parabolaX * 2 - (v1.x + v2.x) / 2,
        y: parabolaY * 2 - (v1.y + v2.y) / 2
      };
      path.value = `M${v1.x},${v1.y} Q${controlPoint.x},${controlPoint.y} ${v2.x},${v2.y}`;
    }
  );

  useAnimatedReaction(
    () => ({
      r1: v1Radius.value,
      r2: v2Radius.value,
      scale: arrowScale.value,
      v1: { x: v1x.value, y: v1y.value },
      v2: { x: v2x.value, y: v2y.value }
    }),
    ({ r1, r2, scale, v1, v2 }) => {
      const height = Math.min(
        Math.max(0, distanceBetweenVectors(v1, v2) - (r1 + r2)),
        1.5 * r2 * scale
      );
      arrowHeight.value = height;
      arrowWidth.value = (2 / 3) * height;
    }
  );

  return (
    <>
      <RenderedCurvedEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        path={path}
        renderer={renderers.edge}
        value={value}
      />
      <ArrowComponent
        animationProgress={animationProgress}
        directionVector={dirVec}
        height={arrowHeight}
        renderer={renderers.arrow}
        tipPosition={arrowTipPosition}
        width={arrowWidth}
      />
    </>
  );
}

export default memo(
  DirectedCurvedEdgeComponent
) as typeof DirectedCurvedEdgeComponent;
