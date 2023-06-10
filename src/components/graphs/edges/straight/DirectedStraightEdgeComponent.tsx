import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import EdgeArrowComponent from '@/components/graphs/arrows/EdgeArrowComponent';
import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { DirectedStraightEdgeComponentProps } from '@/types/components/edges';
import {
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

function DirectedStraightEdgeComponent<E, V>({
  edge,
  v1Position,
  v2Position,
  v1Radius,
  v2Radius,
  componentSettings,
  animatedOrder,
  animatedEdgesCount,
  animationProgress,
  renderers,
  onRender
}: DirectedStraightEdgeComponentProps<E, V>) {
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
  // Edge label
  const centerX = useDerivedValue(() => (p1.value.x + p2.value.x) / 2);
  const centerY = useDerivedValue(() => (p1.value.y + p2.value.y) / 2);
  const labelHeight = useSharedValue(0);

  useEffect(() => {
    onRender?.(edge.key, { x: centerX, y: centerY });
  }, [edge.key]);

  useAnimatedReaction(
    () => ({
      v1: animatedVectorCoordinatesToVector(v1Position),
      v2: animatedVectorCoordinatesToVector(v2Position),
      r1: v1Radius.value,
      r2: v2Radius.value,
      order: animatedOrder.value,
      edgesCount: animatedEdgesCount.value
    }),
    ({ v1, v2, r1, r2, order, edgesCount }) => {
      const calcOffset = calcTranslationOffset.bind(
        null,
        order,
        edgesCount,
        componentSettings.maxOffsetFactor
      );

      const p1Offset = calcOffset(r1);
      const p2Offset = calcOffset(r2);

      const p1Translation = multiplyVector(
        calcOrthogonalUnitVector(v1, v2),
        p1Offset
      );
      const p2Translation = multiplyVector(
        calcOrthogonalUnitVector(v2, v1),
        p2Offset
      );
      // Update edge line points positions
      p1.value = {
        x: v1.x + p1Translation.x,
        y: v1.y + p1Translation.y
      };
      p2.value = {
        x: v2.x + p2Translation.x,
        y: v2.y + p2Translation.y
      };
      // Update edge arrow tip position
      arrowTipPosition.value = translateAlongVector(
        p2.value,
        dirVec.value,
        Math.sqrt(r2 ** 2 - p2Offset ** 2)
      );
      const maxSize = (p1Offset + p2Offset) / (edgesCount - 1);
      // Update edge label max size
      const avgRadius = (r1 + r2) / 2;
      if (componentSettings.label?.sizeRatio) {
        labelHeight.value = Math.min(
          componentSettings.label.sizeRatio * avgRadius,
          maxSize
        );
      }
      // Update edge arrow max size
      arrowWidth.value = Math.min(
        maxSize,
        componentSettings.arrow.scale * avgRadius
      );
    }
  );

  return (
    <>
      {renderers.edge({
        key: edge.key,
        data: edge.value,
        p1,
        p2,
        animationProgress
      })}
      <EdgeArrowComponent
        directionVector={dirVec}
        tipPosition={arrowTipPosition}
        renderer={renderers.arrow}
        vertexRadius={v2Radius}
        width={arrowWidth}
        height={arrowHeight}
        animationProgress={animationProgress}
      />
      {renderers.label && (
        <EdgeLabelComponent
          edge={edge}
          v1Position={v1Position}
          v2Position={v2Position}
          centerX={centerX}
          centerY={centerY}
          height={labelHeight}
          renderer={renderers.label}
          animationProgress={animationProgress}
        />
      )}
    </>
  );
}

export default memo(DirectedStraightEdgeComponent) as <E, V>(
  props: DirectedStraightEdgeComponentProps<E, V>
) => JSX.Element;
