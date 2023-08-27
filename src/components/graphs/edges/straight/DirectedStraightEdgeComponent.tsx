/* eslint-disable import/no-unused-modules */
import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { DirectedStraightEdgeComponentProps } from '@/types/components';
import {
  addVectors,
  calcOrthogonalVector,
  calcUnitVector,
  multiplyVector
} from '@/utils/vectors';
import { calcTranslationOnProgress } from '@/utils/views';

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
    animationSettings,
    key,
    labelHeight,
    labelPosition,
    ordering,
    transform: { points: transformPoints, progress: transformProgress },
    value
  },
  renderers,
  settings
}: DirectedStraightEdgeComponentProps<V, E>) {
  const {
    arrow: { scale: arrowScale },
    edge: { maxOffsetFactor },
    label: { scale: labelScale },
    vertex: { radius: vertexRadius }
  } = settings;

  const p1 = useSharedValue({
    x: transformPoints.value.v1Source.x,
    y: transformPoints.value.v1Source.y
  });
  const p2 = useSharedValue({
    x: transformPoints.value.v2Source.x,
    y: transformPoints.value.v2Source.y
  });

  useAnimatedReaction(
    () => ({
      offsetFactor: maxOffsetFactor.value,
      ordering: ordering.value,
      points: transformPoints.value,
      progress: transformProgress.value,
      r: vertexRadius.value
    }),
    ({
      offsetFactor,
      ordering: { edgesCount, order },
      points: { v1Source, v1Target, v2Source, v2Target },
      progress,
      r
    }) => {
      const v1 = calcTranslationOnProgress(progress, v1Source, v1Target);
      const v2 = calcTranslationOnProgress(progress, v2Source, v2Target);
      const directionVector = calcUnitVector(v2, v1);
      const offset = calcTranslationOffset(order, edgesCount, offsetFactor, r);
      const translationDirection = calcOrthogonalVector(directionVector);
      const translationVector = multiplyVector(translationDirection, offset);

      // Update edge line points positions
      p1.value = addVectors(v1, translationVector);
      p2.value = addVectors(v2, translationVector);
    }
  );

  // useAnimatedReaction(() => ({
  //   p1: v1Points.value,
  //   p2: v2Points.value,

  // Edge arrow
  // const dirVector = useSharedValue(calcUnitVector(p2.value, p1.value));
  // const arrowTipPosition = useSharedValue(p2.value);
  // const arrowWidth = useSharedValue(0);
  // const arrowHeight = useSharedValue(0);
  // Edge label
  // const targetLabelHeight = useSharedValue(0);

  // // Edge label
  // useAnimatedReaction(
  //   () => ({
  //     current: labelHeight.value,
  //     target: targetLabelHeight.value
  //   }),
  //   ({ current, target }) => {
  //     labelHeight.value = animated
  //       ? animateToValue(current, target, 0.1, 100)
  //       : target;
  //   }
  // );

  // Edge
  // useAnimatedReaction(
  //   () => ({
  //     arrowScale: arrowScale.value,
  //     edgesCount: edgesCount.value,
  //     labelScale: labelScale.value,
  //     maxOffsetFactor: maxOffsetFactor.value,
  //     p1Offset: p1Offset.value,
  //     p2Offset: p2Offset.value,
  //     r1: v1Radius.value,
  //     r2: v2Radius.value,
  //     v1: { x: v1x.value, y: v1y.value },
  //     v2: { x: v2x.value, y: v2y.value }
  //   }),
  //   ({ r1, r2, v1, v2, ...s }) => {
  //     const directionVector = calcUnitVector(v2, v1);
  //     dirVector.value = directionVector;

  //     const translationVector = calcOrthogonalVector(directionVector);
  //     const p1Translation = multiplyVector(translationVector, s.p1Offset);
  //     const p2Translation = multiplyVector(translationVector, s.p2Offset);
  //     // Update edge line points positions
  //     p1.value = addVectors(v1, p1Translation);
  //     p2.value = addVectors(v2, p2Translation);
  //     // Update edge arrow tip position
  //     arrowTipPosition.value = translateAlongVector(
  //       p2.value,
  //       directionVector,
  //       Math.sqrt(r2 ** 2 - s.p2Offset ** 2)
  //     );
  //     // Update edge label max size
  //     const maxSize =
  //       (s.maxOffsetFactor * (r1 + r2)) /
  //       (s.edgesCount > 0 ? s.edgesCount - 1 : 1);
  //     const avgRadius = (r1 + r2) / 2;
  //     if (labelScale) {
  //       const target = Math.min(maxSize, s.labelScale * avgRadius);
  //       targetLabelHeight.value = target;
  //       if (!labelHeight.value) labelHeight.value = target;
  //     }
  //     // Update edge arrow size
  //     const arrWidth = (arrowWidth.value = Math.min(
  //       maxSize,
  //       s.arrowScale * avgRadius
  //     ));
  //     arrowHeight.value = Math.min(
  //       Math.max(0, distanceBetweenVectors(v1, v2) - (r1 + r2)),
  //       1.5 * arrWidth
  //     );
  //     // Update label position
  //     labelPosition.x.value = (p1.value.x + p2.value.x) / 2;
  //     labelPosition.y.value = (p1.value.y + p2.value.y) / 2;
  //   }
  // );

  return (
    <>
      {/* TODO - maybe use renderer directly (remember to memoize arrow) */}
      <RenderedStraightEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        p1={p1}
        p2={p2}
        renderer={renderers.edge}
        value={value}
      />
      {/* <ArrowComponent
        animationProgress={animationProgress}
        directionVector={dirVector}
        height={arrowHeight}
        renderer={renderers.arrow}
        tipPosition={arrowTipPosition}
        width={arrowWidth}
      /> */}
    </>
  );
}

export default memo(
  DirectedStraightEdgeComponent
) as typeof DirectedStraightEdgeComponent;
