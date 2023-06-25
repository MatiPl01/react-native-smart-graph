import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { UndirectedStraightEdgeComponentProps } from '@/types/components/edges';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  multiplyVector
} from '@/utils/vectors';

const calcTranslationOffset = (
  order: number,
  edgesCount: number,
  maxOffsetFactor: number,
  vertexRadius: number
): number => {
  'worklet';
  const maxTranslationOffset = maxOffsetFactor * vertexRadius;
  const edgesPerSide = (edgesCount - 1) / 2;
  return edgesCount > 1
    ? (maxTranslationOffset * (order - edgesPerSide)) / edgesPerSide
    : 0;
};

function UndirectedStraightEdgeComponent<E, V>({
  animatedEdgesCount,
  animatedOrder,
  animationProgress,
  componentSettings,
  edge,
  focusProgress,
  onRender,
  renderers,
  v1Position,
  v1Radius,
  v2Position,
  v2Radius
}: UndirectedStraightEdgeComponentProps<E, V>) {
  // Edge line
  const p1 = useSharedValue({
    x: v1Position.x.value,
    y: v1Position.y.value
  });
  const p2 = useSharedValue({
    x: v2Position.x.value,
    y: v2Position.y.value
  });
  // Edge label
  const centerX = useDerivedValue(() => (p1.value.x + p2.value.x) / 2);
  const centerY = useDerivedValue(() => (p1.value.y + p2.value.y) / 2);
  const labelHeight = useSharedValue(0);

  const v1Key = edge.vertices[0].key;
  const v2Key = edge.vertices[1].key;

  useEffect(() => {
    onRender(edge.key, {
      focusProgress,
      labelPosition: { x: centerX, y: centerY }
    });
  }, [edge.key]);

  useAnimatedReaction(
    () => {
      let v1: AnimatedVectorCoordinates, v2: AnimatedVectorCoordinates;

      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first on the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        v1 = v2Position;
        v2 = v1Position;
      } else {
        v1 = v1Position;
        v2 = v2Position;
      }

      return {
        edgesCount: animatedEdgesCount.value,
        order: animatedOrder.value,
        r1: v1Radius.value,
        r2: v2Radius.value,
        v1: animatedVectorCoordinatesToVector(v1),
        v2: animatedVectorCoordinatesToVector(v2)
      };
    },
    ({ edgesCount, order, r1, r2, v1, v2 }) => {
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
      // Update edge label max size
      if (componentSettings.label?.sizeRatio) {
        const avgOffset = (p1Offset + p2Offset) / 2;
        labelHeight.value =
          2 * (edgesCount === 1 ? avgOffset : avgOffset / (edgesCount - 1));
      }
    }
  );

  return (
    <>
      {renderers.edge({
        animationProgress,
        data: edge.value,
        focusProgress,
        key: edge.key,
        p1,
        p2
      })}
      {renderers.label && (
        <EdgeLabelComponent
          animationProgress={animationProgress}
          centerX={centerX}
          centerY={centerY}
          edge={edge}
          focusProgress={focusProgress}
          height={labelHeight}
          renderer={renderers.label}
          v1Position={v1Position}
          v2Position={v2Position}
        />
      )}
    </>
  );
}

export default memo(UndirectedStraightEdgeComponent) as <E, V>(
  props: UndirectedStraightEdgeComponentProps<E, V>
) => JSX.Element;
