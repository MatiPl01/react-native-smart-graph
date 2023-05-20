import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { Vector, rotate } from '@shopify/react-native-skia';

import { DirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import { getEdgeIndex } from '@/utils/graphs/layout';
import {
  animatedVectorToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeArrowComponent from '../../arrows/EdgeArrowComponent';
import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

const parabola = (x: number, a: number, p: number, q: number): number => {
  'worklet';
  return a * (x - p) ** 2 + q;
};

const calcApproxPointOnParabola = (
  x1: number,
  a: number,
  p: number,
  q: number,
  d: number
): Vector => {
  'worklet';
  const tangentSlope = 2 * a * (x1 - p);
  const dPrime = d / Math.sqrt(1 + tangentSlope * tangentSlope);
  const x2 = x1 + dPrime;
  const y2 = parabola(x2, a, p, q);
  return { x: x2, y: y2 };
};

export default function DirectedCurvedEdgeComponent<E, V>({
  v1Position,
  v2Position,
  vertexRadius,
  edge,
  edgesBetweenVertices,
  renderers,
  settings,
  animationProgress,
  removed
}: DirectedCurvedEdgeComponentProps<E, V>) {
  const edgesCount = edgesBetweenVertices.length;
  const edgeIndex = getEdgeIndex(edge, edgesBetweenVertices);

  // Parabola vertex
  const parabolaVertex = useSharedValue({
    x: (v1Position.x.value + v2Position.x.value) / 2,
    y: (v1Position.y.value + v2Position.y.value) / 2
  });
  // Edge label
  const maxLabelSize = useSharedValue(10); // TODO - calculate this
  // Edge arrow
  const arrowWidth = useSharedValue(10); // TODO - calculate this
  const arrowHeight = useDerivedValue(() => 1.5 * arrowWidth.value);
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

  useAnimatedReaction(
    () => {
      const p1 = animatedVectorToVector(v1Position);
      const p2 = animatedVectorToVector(v2Position);

      return {
        p1,
        p2,
        center: {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2
        }
      };
    },
    ({ p1, p2, center }) => {
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(
        animatedVectorToVector(v1Position),
        animatedVectorToVector(v2Position)
      );
      const offset = 20 * (edgeIndex - (edgesCount - 1) / 2); // TODO - make this configurable
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
          maxSize={maxLabelSize}
          renderer={renderers.label}
          // TODO -  pass label settings to the label component
        />
      )}
    </>
  );
}
