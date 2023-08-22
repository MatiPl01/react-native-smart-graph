import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedCurvedEdgeComponentProps } from '@/types/components';
import { calcApproxPointOnParabola } from '@/utils/math';
import {
  calcOrthogonalUnitVector,
  calcUnitVector,
  distanceBetweenVectors,
  rotateVector,
  translateAlongVector
} from '@/utils/vectors';

import RenderedCurvedEdgeComponent from './RenderedCurvedEdgeComponent';

function DirectedCurvedEdgeComponent<V, E>({
  animatedEdgesCount,
  animatedOrder,
  data: {
    animationProgress,
    key,
    labelHeight,
    labelPosition,
    v1Position,
    v1Radius,
    v2Position,
    v2Radius,
    value
  },
  renderers,
  settings
}: DirectedCurvedEdgeComponentProps<V, E>) {
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
  // Edge arrow
  const arrowHeight = useDerivedValue(() =>
    Math.min(
      Math.max(
        0,
        distanceBetweenVectors(p1.value, p2.value) -
          (v1Radius.value + v2Radius.value)
      ),
      1.5 * v2Radius.value * settings.arrow.scale.value
    )
  );
  const arrowWidth = useDerivedValue(() => (2 / 3) * arrowHeight.value);
  const arrowTipPosition = useSharedValue({ x: 0, y: 0 });
  const dirVec = useSharedValue({ x: 0, y: 0 });
  // Edge curve path
  const path = useDerivedValue(() => {
    const controlPoint = {
      x: parabolaX.value * 2 - (v1Position.x.value + v2Position.x.value) / 2,
      y: parabolaY.value * 2 - (v1Position.y.value + v2Position.y.value) / 2
    };

    // Create the SVG path string with the 'Q' command for a quadratic curve
    const pathString = `M${v1Position.x.value},${v1Position.y.value} Q${controlPoint.x},${controlPoint.y} ${v2Position.x.value},${v2Position.y.value}`;

    return pathString;
  });

  // Edge label
  useAnimatedReaction(
    () =>
      settings.label
        ? {
            r1: v1Radius.value,
            r2: v2Radius.value,
            scale: settings.label?.scale.value
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
      edgesCount: animatedEdgesCount.value,
      labelSize: labelHeight.value,
      order: animatedOrder.value,
      r2: v2Radius.value,
      v1: p1.value,
      v2: p2.value
    }),
    ({ edgesCount, labelSize, order, r2, v1, v2 }) => {
      const center = {
        x: (v1.x + v2.x) / 2,
        y: (v1.y + v2.y) / 2
      };
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(v1, v2);
      const offset = labelSize * (order - (edgesCount - 1) / 2);
      const { x, y } = translateAlongVector(
        center,
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX.value = x;
      labelPosition.y.value = parabolaY.value = y;

      // Calculate the edge arrow tip position and direction vector
      // If points are collinear
      if (v1.x === x || v1.y === y) {
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
        const plainP2 = rotateVector(v2, center, rotationAngle);
        const plainParabolaVertex = rotateVector(
          { x, y },
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
        const rotatedArrowTipPosition = rotateVector(
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
        const rotatedArrowEndPosition = rotateVector(
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
    }
  );

  return (
    <>
      <RenderedCurvedEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        parabolaX={parabolaX}
        parabolaY={parabolaY}
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
