import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import EdgeArrowComponent from '@/components/graphs/arrows/EdgeArrowComponent';
import { DirectedStraightEdgeComponentProps } from '@/types/components/edges';
import {
  addVectors,
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  multiplyVector,
  translateAlongVector
} from '@/utils/vectors';

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
  animationProgress,
  componentSettings,
  edge,
  labelHeight,
  labelPosition,
  renderers,
  v1Position,
  v1Radius,
  v2Position,
  v2Radius
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
  const dirVec = useDerivedValue(() => calcUnitVector(p2.value, p1.value));
  const arrowTipPosition = useSharedValue(p2.value);
  const arrowWidth = useSharedValue(0);
  const arrowHeight = useDerivedValue(() => 1.5 * arrowWidth.value);

  useAnimatedReaction(
    () => ({
      edgesCount: animatedEdgesCount.value,
      order: animatedOrder.value,
      r1: v1Radius.value,
      r2: v2Radius.value,
      v1: animatedVectorCoordinatesToVector(v1Position),
      v2: animatedVectorCoordinatesToVector(v2Position)
    }),
    ({ edgesCount, order, r1, r2, v1, v2 }) => {
      const calcOffset = calcTranslationOffset.bind(
        null,
        order,
        edgesCount,
        componentSettings.edge.maxOffsetFactor
      );

      const p1Offset = calcOffset(r1);
      const p2Offset = calcOffset(r2);

      const dirVector = calcOrthogonalUnitVector(v1, v2);
      const p1Translation = multiplyVector(dirVector, p1Offset);
      const p2Translation = multiplyVector(dirVector, p2Offset);
      // Update edge line points positions
      p1.value = addVectors(v1, p1Translation);
      p2.value = addVectors(v2, p2Translation);
      // Update edge arrow tip position
      arrowTipPosition.value = translateAlongVector(
        p2.value,
        dirVec.value,
        Math.sqrt(r2 ** 2 - p2Offset ** 2)
      );
      // Update edge label max size
      const maxSize =
        (componentSettings.edge.maxOffsetFactor * (r1 + r2)) /
        (edgesCount > 0 ? edgesCount - 1 : 1);
      const avgRadius = (r1 + r2) / 2;
      if (componentSettings.label?.scale) {
        labelHeight.value = Math.min(
          maxSize,
          componentSettings.label.scale * avgRadius
        );
      }
      // Update edge arrow max size
      arrowWidth.value = Math.min(
        maxSize,
        componentSettings.arrow.scale * avgRadius
      );
      // Update label position
      labelPosition.x.value = (p1.value.x + p2.value.x) / 2;
      labelPosition.y.value = (p1.value.y + p2.value.y) / 2;
    }
  );

  return (
    <>
      {renderers.edge({
        animationProgress,
        key: edge.key,
        p1,
        p2,
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

export default memo(DirectedStraightEdgeComponent) as <V, E>(
  props: DirectedStraightEdgeComponentProps<V, E>
) => JSX.Element;
