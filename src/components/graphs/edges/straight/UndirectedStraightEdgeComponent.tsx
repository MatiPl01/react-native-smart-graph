import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { UndirectedStraightEdgeComponentProps } from '@/types/components/edges';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  multiplyVector
} from '@/utils/vectors';

import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

function UndirectedStraightEdgeComponent<E, V>({
  v1Position,
  v2Position,
  vertexRadius,
  edge,
  animatedOrder,
  animatedEdgesCount,
  settings,
  animationProgress,
  renderers,
  onLabelRender
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
  const center = useDerivedValue(() => ({
    x: (p1.value.x + p2.value.x) / 2,
    y: (p1.value.y + p2.value.y) / 2
  }));
  const labelHeight = useSharedValue(0);

  const v1Key = edge.vertices[0].key;
  const v2Key = edge.vertices[1].key;

  useEffect(() => {
    onLabelRender?.(edge.key, center);
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
        v1: animatedVectorCoordinatesToVector(v1),
        v2: animatedVectorCoordinatesToVector(v2),
        order: animatedOrder.value,
        edgesCount: animatedEdgesCount.value
      };
    },
    ({ v1, v2, order, edgesCount }) => {
      const maxTranslationOffset = settings.maxOffsetFactor * vertexRadius;
      const edgesPerSide = (edgesCount - 1) / 2;
      const translationOffset =
        edgesCount > 1
          ? (maxTranslationOffset * (order - edgesPerSide)) / edgesPerSide
          : 0;
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
      // Update edge label max size
      labelHeight.value =
        2 *
        (edgesCount === 1
          ? maxTranslationOffset
          : maxTranslationOffset / (edgesCount - 1));
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

export default memo(UndirectedStraightEdgeComponent) as <E, V>(
  props: UndirectedStraightEdgeComponentProps<E, V>
) => JSX.Element;
