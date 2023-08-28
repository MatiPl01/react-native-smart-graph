/* eslint-disable import/no-unused-modules */
import { rotate } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedCurvedEdgeComponentProps } from '@/types/components';
import { calcApproxPointOnParabola } from '@/utils/math';
import { calcUnitVector } from '@/utils/vectors';

import CurvedEdgeComponent from './CurvedEdgeComponent';
import { EdgePointsOrderGetter, useCurvedEdge } from './utils';

const getEdgePointsOrder: EdgePointsOrderGetter = () => {
  'worklet';
  return -1; // ALways determined by the edge direction
};

function DirectedCurvedEdgeComponent<V, E>(
  props: DirectedCurvedEdgeComponentProps<V, E>
) {
  const {
    data: { animationProgress, key, value },
    renderers,
    settings: {
      arrow: { scale: arrowScale },
      vertex: { radius: vertexRadius, scale: vertexScale }
    }
  } = props;

  // ARROW COMPONENT PROPS
  const arrowTransform = useSharedValue({
    dirVector: { x: 0, y: 0 },
    scale: 0,
    tipPosition: { x: 0, y: 0 }
  });

  const { path } = useCurvedEdge(
    props,
    getEdgePointsOrder,
    () => ({
      arrowScale,
      vertexScale
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
      const plainParabolaVertex = rotate(parabolaPoint, center, rotationAngle);
      // 3. Calculate the canonical parabola equation coefficients
      const { x: p, y: q } = plainParabolaVertex;
      const a = (plainP2.y - q) / (plainP2.x - p) ** 2;
      // 4. Calculate the edge arrow tip position
      console.log(props.data.key);
      const plainArrowTipPosition = calcApproxPointOnParabola(
        plainP2.x,
        a,
        p,
        q,
        -vertexRadius * customProps.vertexScale
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
      arrowTransform.value = {
        dirVector,
        scale: customProps.arrowScale * customProps.vertexScale,
        tipPosition: rotatedArrowTipPosition
      };
    }
  );

  return (
    <>
      <CurvedEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        path={path}
        renderer={renderers.edge}
        value={value}
        vertexScale={vertexScale}
      />
      <ArrowComponent
        animationProgress={animationProgress}
        renderer={renderers.arrow}
        transform={arrowTransform}
        vertexRadius={vertexRadius}
      />
    </>
  );
}

export default memo(
  DirectedCurvedEdgeComponent
) as typeof DirectedCurvedEdgeComponent;
