import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DirectedStraightEdgeComponentProps } from '@/types/components/edges';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  multiplyVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeArrowComponent from '../../arrows/EdgeArrowComponent';
import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

function DirectedStraightEdgeComponent<E, V>({
  v1Position,
  v2Position,
  edge,
  vertexRadius,
  settings,
  animatedOrder,
  animatedEdgesCount,
  animationProgress,
  renderers,
  onLabelRender
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
  const center = useDerivedValue(() => ({
    x: (p1.value.x + p2.value.x) / 2,
    y: (p1.value.y + p2.value.y) / 2
  }));
  const labelHeight = useSharedValue(0);

  useEffect(() => {
    onLabelRender?.(edge.key, center);
  }, [edge.key]);

  useAnimatedReaction(
    () => ({
      v1: animatedVectorCoordinatesToVector(v1Position),
      v2: animatedVectorCoordinatesToVector(v2Position),
      order: animatedOrder.value,
      edgesCount: animatedEdgesCount.value
    }),
    ({ v1, v2, order, edgesCount }) => {
      const maxTranslationOffset = settings.maxOffsetFactor * vertexRadius;
      const translationOffset =
        edgesCount >= 2
          ? (1 - order / ((edgesCount - 1) / 2)) * maxTranslationOffset
          : maxTranslationOffset * (edgesCount - 1);
      const translationVector = multiplyVector(
        calcOrthogonalUnitVector(v1, v2),
        translationOffset
      );
      // Update edge line points positions
      p1.value = {
        x: v1.x + translationVector.x,
        y: v1.y + translationVector.y
      };
      p2.value = {
        x: v2.x + translationVector.x,
        y: v2.y + translationVector.y
      };
      // Update edge arrow tip position
      arrowTipPosition.value = translateAlongVector(
        p2.value,
        dirVec.value,
        Math.sqrt(vertexRadius ** 2 - translationOffset ** 2)
      );
      const maxSize = (2 * maxTranslationOffset) / (edgesCount - 1);
      // Update edge label max size
      if (settings.label?.sizeRatio) {
        labelHeight.value = Math.min(
          settings.label?.sizeRatio * vertexRadius,
          maxSize
        );
      }
      // Update edge arrow max size
      arrowWidth.value = Math.min(maxSize, settings.arrow.scale * vertexRadius);
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
        vertexRadius={vertexRadius}
        width={arrowWidth}
        height={arrowHeight}
        animationProgress={animationProgress}
      />
      {renderers.label && (
        <EdgeLabelComponent
          edge={edge}
          v1Position={v1Position}
          v2Position={v2Position}
          vertexRadius={vertexRadius}
          centerPosition={center}
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
