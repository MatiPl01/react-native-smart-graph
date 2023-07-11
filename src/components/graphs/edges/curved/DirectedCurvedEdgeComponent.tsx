import { rotate } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import EdgeArrowComponent from '@/components/graphs/arrows/EdgeArrowComponent';
import { LABEL_COMPONENT_SETTINGS } from '@/constants/components';
import { DirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import { calcApproxPointOnParabola } from '@/utils/math';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  translateAlongVector
} from '@/utils/vectors';

function DirectedCurvedEdgeComponent<E, V>({
  animatedEdgesCount,
  animatedOrder,
  animationProgress,
  componentSettings,
  edge,
  onRender,
  renderers,
  v1Position,
  v1Radius,
  v2Position,
  v2Radius
}: DirectedCurvedEdgeComponentProps<E, V>) {
  // Parabola vertex
  const parabolaX = useSharedValue(
    (v1Position.x.value + v2Position.x.value) / 2
  );
  const parabolaY = useSharedValue(
    (v1Position.y.value + v2Position.y.value) / 2
  );
  // Edge label
  const labelHeight = useDerivedValue(
    () =>
      ((v1Radius.value + v2Radius.value) / 2) *
      (componentSettings.label?.sizeRatio ?? LABEL_COMPONENT_SETTINGS.sizeRatio)
  );
  // Edge arrow
  const arrowHeight = useDerivedValue(
    () =>
      1.5 *
      Math.min(
        v2Radius.value * componentSettings.arrow.scale,
        labelHeight.value
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

  useEffect(() => {
    onRender(edge.key, {
      animationProgress,
      labelHeight,
      labelPosition: { x: parabolaX, y: parabolaY }
    });
  }, [edge.key]);

  useAnimatedReaction(
    () => {
      const p1 = animatedVectorCoordinatesToVector(v1Position);
      const p2 = animatedVectorCoordinatesToVector(v2Position);

      return {
        center: {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2
        },
        edgesCount: animatedEdgesCount.value,
        labelSize: labelHeight.value,
        order: animatedOrder.value,
        p1,
        p2,
        r2: v2Radius.value
      };
    },
    ({ center, edgesCount, labelSize, order, p1, p2, r2 }) => {
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(
        animatedVectorCoordinatesToVector(v1Position),
        animatedVectorCoordinatesToVector(v2Position)
      );
      const offset = labelSize * (order - (edgesCount - 1) / 2);
      const { x, y } = translateAlongVector(
        center,
        orthogonalUnitVector,
        offset
      );
      parabolaX.value = x;
      parabolaY.value = y;

      // Calculate the edge arrow tip position and direction vector
      // If points are collinear
      if (p1.x === x || p1.y === y) {
        // 1. Calculate the direction vector
        const directionVector = calcUnitVector(p2, p1);
        dirVec.value = directionVector;
        // 2. Calculate the arrow tip position
        const tipPosition = translateAlongVector(p2, directionVector, r2);
        arrowTipPosition.value = tipPosition;
      }
      // Otherwise, if points are not collinear
      else {
        // 1. Get the rotation angle of the coordinate system
        const rotationAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // 2. Rotate points to the new coordinate system
        const plainP2 = rotate(p2, center, rotationAngle);
        const plainParabolaVertex = rotate({ x, y }, center, rotationAngle);
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
    }
  );

  return (
    <>
      {renderers.edge({
        animationProgress,
        key: edge.key,
        parabolaX,
        parabolaY,
        path,
        value: edge.value
      })}
      <EdgeArrowComponent
        animationProgress={animationProgress}
        directionVector={dirVec}
        height={arrowHeight}
        renderer={renderers.arrow}
        tipPosition={arrowTipPosition}
        vertexRadius={v2Radius}
        width={arrowWidth}
      />
    </>
  );
}

export default memo(DirectedCurvedEdgeComponent) as <E, V>(
  props: DirectedCurvedEdgeComponentProps<E, V>
) => JSX.Element;
