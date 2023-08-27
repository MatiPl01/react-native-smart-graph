import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedStraightEdgeComponentProps } from '@/types/components';
import { calcUnitVector, translateAlongVector } from '@/utils/vectors';

import { getEdgeTranslationPoints, getLabelTransform } from './utils';

const calcTranslationOffset = (
  order: number,
  edgesCount: number,
  maxOffsetFactor: number,
  vertexRadius: number
): number => {
  'worklet';
  const maxTranslationOffset = maxOffsetFactor * vertexRadius;
  return edgesCount >= 2
    ? (1 - order / ((edgesCount - 1) / 2)) * maxTranslationOffset
    : maxTranslationOffset * (edgesCount - 1);
};

function DirectedStraightEdgeComponent<V, E>({
  data: {
    animationProgress,
    key,
    label: labelData,
    ordering,
    transform: { points: transformPoints, progress: transformProgress },
    value
  },
  renderers,
  settings: {
    arrow: { scale: arrowScale },
    edge: { maxOffsetFactor },
    label: { displayed: labelDisplayed, scale: labelScale },
    vertex: { radius: vertexRadius }
  }
}: DirectedStraightEdgeComponentProps<V, E>) {
  // EDGE RENDERER PROPS
  const p1 = useSharedValue({
    x: transformPoints.value.v1Source.x,
    y: transformPoints.value.v1Source.y
  });
  const p2 = useSharedValue({
    x: transformPoints.value.v2Source.x,
    y: transformPoints.value.v2Source.y
  });

  // ARROW COMPONENT PROPS
  const arrowTransform = useSharedValue({
    dirVector: calcUnitVector(p2.value, p1.value),
    scale: arrowScale.value,
    tipPosition: p2.value,
    vertexRadius: vertexRadius.value
  });

  useAnimatedReaction(
    () => ({
      label: {
        displayed: labelDisplayed.value,
        scale: labelScale.value
      },
      offsetFactor: maxOffsetFactor.value,
      ordering: ordering.value,
      points: transformPoints.value,
      progress: transformProgress.value,
      r: vertexRadius.value
    }),
    props => {
      const res = getEdgeTranslationPoints(calcTranslationOffset, props);
      p1.value = res.p1;
      p2.value = res.p2;
      // Update label data (if it is displayed)
      const labelTransform = getLabelTransform(res, props);
      if (props.label.displayed) {
        labelData.transform.value = labelTransform;
      }
      // Update the arrow component props
      const dirVector = calcUnitVector(res.p1, res.p2);
      arrowTransform.value = {
        dirVector,
        scale: Math.min(arrowScale.value, labelTransform.scale),
        tipPosition: translateAlongVector(res.p2, dirVector, -props.r),
        vertexRadius: props.r
      };
    }
  );

  return (
    <>
      {renderers.edge({
        animationProgress,
        key,
        p1,
        p2,
        value
      })}
      <ArrowComponent
        animationProgress={animationProgress}
        renderer={renderers.arrow}
        transform={arrowTransform}
      />
    </>
  );
}

export default memo(
  DirectedStraightEdgeComponent
) as typeof DirectedStraightEdgeComponent;
