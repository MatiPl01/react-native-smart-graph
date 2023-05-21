import { useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { Vector, rotate } from '@shopify/react-native-skia';

import { DirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import { getEdgeIndex } from '@/utils/graphs/layout';
import { calcApproxPointOnParabola } from '@/utils/math';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeArrowComponent from '../../arrows/EdgeArrowComponent';
import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

export default function DirectedCurvedEdgeComponent<E, V>({
  v1Position,
  v2Position,
  vertexRadius,
  edge,
  edgesBetweenVertices,
  renderers,
  settings,
  animationProgress,
  removed,
  onLabelRender
}: DirectedCurvedEdgeComponentProps<E, V>) {
  const edgesCount = edgesBetweenVertices.length;
  const edgeIndex = getEdgeIndex(edge, edgesBetweenVertices);

  // Parabola vertex
  const parabolaVertex = useSharedValue<Vector>({
    x: (v1Position.x.value + v2Position.x.value) / 2,
    y: (v1Position.y.value + v2Position.y.value) / 2
  });
  // Edge label
  const labelHeight = useSharedValue(
    vertexRadius * (settings.label?.sizeRatio || 0.5)
  );
  // Edge arrow
  const arrowHeight = useDerivedValue(
    () => 1.5 * Math.min(vertexRadius * settings.arrow.scale, labelHeight.value)
  );
  const arrowWidth = useDerivedValue(() => (2 / 3) * arrowHeight.value);
  const arrowTipPosition = useSharedValue({ x: 0, y: 0 });
  const dirVec = useSharedValue({ x: 0, y: 0 });
  // Edge curve path
  const path = useDerivedValue(() => {
    const controlPoint = {
      x:
        parabolaVertex.value.x * 2 -
        (v1Position.x.value + v2Position.x.value) / 2,
      y:
        parabolaVertex.value.y * 2 -
        (v1Position.y.value + v2Position.y.value) / 2
    };

    // Create the SVG path string with the 'Q' command for a quadratic curve
    const pathString = `M${v1Position.x.value},${v1Position.y.value} Q${controlPoint.x},${controlPoint.y} ${v2Position.x.value},${v2Position.y.value}`;

    return pathString;
  });

  useEffect(() => {
    onLabelRender?.(edge.key, parabolaVertex);
  }, [edge.key]);

  useAnimatedReaction(
    () => {
      const p1 = animatedVectorCoordinatesToVector(v1Position);
      const p2 = animatedVectorCoordinatesToVector(v2Position);

      return {
        p1,
        p2,
        center: {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2
        },
        labelSize: labelHeight.value
      };
    },
    ({ p1, p2, center, labelSize }) => {
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(
        animatedVectorCoordinatesToVector(v1Position),
        animatedVectorCoordinatesToVector(v2Position)
      );
      const offset = labelSize * (edgeIndex - (edgesCount - 1) / 2);
      const parabolaVertexPosition = translateAlongVector(
        center,
        orthogonalUnitVector,
        offset
      );
      parabolaVertex.value = parabolaVertexPosition;

      // Calculate the edge arrow tip position and direction vector
      // If points are collinear
      if (p1.x === p2.x || p1.y === p2.y) {
        // 1. Calculate the direction vector
        const directionVector = calcUnitVector(p2, p1);
        dirVec.value = directionVector;
        // 2. Calculate the arrow tip position
        const tipPosition = translateAlongVector(
          p2,
          directionVector,
          -vertexRadius
        );
        arrowTipPosition.value = tipPosition;
      }
      // Otherwise, if points are not collinear
      else {
        // 1. Get the rotation angle of the coordinate system
        const rotationAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // 2. Rotate points to the new coordinate system
        const plainP2 = rotate(p2, center, rotationAngle);
        const plainParabolaVertex = rotate(
          parabolaVertexPosition,
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
          -vertexRadius
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

  const sharedProps = {
    animationProgress,
    removed
  };

  return (
    <>
      {renderers.edge({
        ...sharedProps,
        key: edge.key,
        data: edge.value,
        parabolaVertex,
        path
      })}
      <EdgeArrowComponent
        {...sharedProps}
        directionVector={dirVec}
        tipPosition={arrowTipPosition}
        renderer={renderers.arrow}
        vertexRadius={vertexRadius}
        width={arrowWidth}
        height={arrowHeight}
      />
      {renderers.label && (
        <EdgeLabelComponent
          {...sharedProps}
          edge={edge}
          v1Position={v1Position}
          v2Position={v2Position}
          vertexRadius={vertexRadius}
          centerPosition={parabolaVertex}
          height={labelHeight}
          renderer={renderers.label}
        />
      )}
    </>
  );
}
