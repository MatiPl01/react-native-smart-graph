import { rotate, Transforms2d } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { EdgeArrowComponent } from '@/components/graphs/arrows';
import { calcEdgeArrowTransform } from '@/components/graphs/arrows/utils';
import { DirectedCurvedEdgeComponentProps } from '@/types/components';
import { calcApproxPointOnParabola } from '@/utils/math';
import { calcUnitVector } from '@/utils/vectors';

import CurvedEdgeComponent from './CurvedEdgeComponent';
import { EdgePointsOrderGetter, useCurvedEdge } from './utils';

const getEdgePointsOrder: EdgePointsOrderGetter = () => {
  'worklet';
  return -1; // Always determined by the edge direction
};

function DirectedCurvedEdgeComponent<V, E>(
  props: DirectedCurvedEdgeComponentProps<V, E>
) {
  const {
    data: { animationProgress, key, value },
    focusProgress,
    renderers: { arrow: edgeArrowRenderer, edge: edgeRenderer },
    settings: {
      arrow: { scale: arrowScale },
      vertex: { radius: vertexRadius }
    }
  } = props;

  // ARROW COMPONENT PROPS
  const arrowTransform = useSharedValue<Transforms2d>([{ scale: 0 }]);

  const { path } = useCurvedEdge(
    props,
    getEdgePointsOrder,
    // Additional settings for the arrow component
    edgeArrowRenderer
      ? [
          () => ({
            arrowScale
          }),
          ({
            customProps,
            transform: {
              edge: { parabolaPoint, v1, v2 }
            }
          }) => {
            'worklet';
            // Update the arrow component props
            const center = {
              x: (v1.x + v2.x) / 2,
              y: (v1.y + v2.y) / 2
            };
            // 1. Get the rotation angle of the coordinate system
            const rotationAngle = Math.atan2(v2.y - v1.y, v2.x - v1.x);
            // 2. Rotate points to the new coordinate system
            const plainP2 = rotate(v2, center, rotationAngle);
            const plainParabolaVertex = rotate(
              parabolaPoint,
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
              vertexRadius * customProps.arrowScale
            );
            const rotatedArrowEndPosition = rotate(
              plainArrowEndPosition,
              center,
              -rotationAngle
            );
            const dirVector = calcUnitVector(
              rotatedArrowTipPosition,
              rotatedArrowEndPosition
            );
            // 6. Update the values
            arrowTransform.value = calcEdgeArrowTransform(
              rotatedArrowTipPosition,
              dirVector,
              customProps.arrowScale,
              vertexRadius
            );
          }
        ]
      : undefined
  );

  return (
    <>
      <CurvedEdgeComponent<E>
        animationProgress={animationProgress}
        customProps={edgeRenderer.props}
        edgeKey={key}
        focusProgress={focusProgress}
        path={path}
        renderer={edgeRenderer.renderer}
        value={value as E}
      />
      {edgeArrowRenderer && (
        <EdgeArrowComponent
          animationProgress={animationProgress}
          renderer={edgeArrowRenderer}
          transform={arrowTransform}
          vertexRadius={vertexRadius}
        />
      )}
    </>
  );
}

export default memo(
  DirectedCurvedEdgeComponent
) as typeof DirectedCurvedEdgeComponent;
