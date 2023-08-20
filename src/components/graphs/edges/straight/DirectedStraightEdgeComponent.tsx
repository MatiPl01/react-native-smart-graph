/* eslint-disable import/no-unused-modules */
import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedStraightEdgeComponentProps } from '@/types/components';
import {
  addVectors,
  calcOrthogonalVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector,
  translateAlongVector
} from '@/utils/vectors';

import RenderedStraightEdgeComponent from './RenderedStraightEdgeComponent';

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
}: DirectedStraightEdgeComponentProps<V, E>) {
  // Edge line
  const p1 = useSharedValue({
    x: v1Position.x.value,
    y: v1Position.y.value
  });
  const p2 = useSharedValue({
    x: v2Position.x.value,
    y: v2Position.y.value
  });
  // Edge arrow
  const dirVector = useDerivedValue(() => calcUnitVector(p2.value, p1.value));
  const arrowTipPosition = useSharedValue(p2.value);
  const arrowWidth = useSharedValue(0);
  const arrowHeight = useDerivedValue(() =>
    Math.min(
      Math.max(
        0,
        distanceBetweenVectors(p1.value, p2.value) -
          (v1Radius.value + v2Radius.value)
      ),
      1.5 * arrowWidth.value
    )
  );

  useAnimatedReaction(
    () => ({
      arrowScale: settings.arrow.scale.value,
      dirVec: dirVector.value,
      edgesCount: animatedEdgesCount.value,
      labelScale: settings.label?.scale.value,
      maxOffsetFactor: settings.edge.maxOffsetFactor.value,
      order: animatedOrder.value,
      r1: v1Radius.value,
      r2: v2Radius.value
    }),
    ({
      arrowScale,
      dirVec,
      edgesCount,
      labelScale,
      maxOffsetFactor,
      order,
      r1,
      r2
    }) => {
      const v1 = { x: v1Position.x.value, y: v1Position.y.value };
      const v2 = { x: v2Position.x.value, y: v2Position.y.value };
      const calcOffset = calcTranslationOffset.bind(
        null,
        order,
        edgesCount,
        maxOffsetFactor
      );

      const p1Offset = calcOffset(r1);
      const p2Offset = calcOffset(r2);

      const translationVector = calcOrthogonalVector(dirVec);
      const p1Translation = multiplyVector(translationVector, p1Offset);
      const p2Translation = multiplyVector(translationVector, p2Offset);
      // Update edge line points positions
      p1.value = addVectors(v1, p1Translation);
      p2.value = addVectors(v2, p2Translation);
      // Update edge arrow tip position
      arrowTipPosition.value = translateAlongVector(
        p2.value,
        dirVec,
        Math.sqrt(r2 ** 2 - p2Offset ** 2)
      );
      // Update edge label max size
      const maxSize =
        (maxOffsetFactor * (r1 + r2)) / (edgesCount > 0 ? edgesCount - 1 : 1);
      const avgRadius = (r1 + r2) / 2;
      if (labelScale) {
        labelHeight.value = Math.min(maxSize, labelScale * avgRadius);
      }
      // Update edge arrow max size
      arrowWidth.value = Math.min(maxSize, arrowScale * avgRadius);
      // Update label position
      labelPosition.x.value = (p1.value.x + p2.value.x) / 2;
      labelPosition.y.value = (p1.value.y + p2.value.y) / 2;
    }
  );

  return (
    <>
      <RenderedStraightEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        p1={p1}
        p2={p2}
        renderer={renderers.edge}
        value={value}
      />
      <ArrowComponent
        animationProgress={animationProgress}
        directionVector={dirVector}
        height={arrowHeight}
        renderer={renderers.arrow}
        tipPosition={arrowTipPosition}
        width={arrowWidth}
      />
    </>
  );
}

export default memo(
  DirectedStraightEdgeComponent
) as typeof DirectedStraightEdgeComponent;
