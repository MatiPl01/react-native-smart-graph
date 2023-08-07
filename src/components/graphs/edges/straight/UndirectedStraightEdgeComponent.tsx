import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { UndirectedStraightEdgeComponentProps } from '@/types/components';
import {
  addVectors,
  calcOrthogonalUnitVector,
  multiplyVector
} from '@/utils/vectors';

/* eslint-disable import/no-unused-modules */
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

function UndirectedStraightEdgeComponent<V, E>({
  animatedEdgesCount,
  animatedOrder,
  data: {
    animationProgress,
    edge,
    labelHeight,
    labelPosition,
    v1Position,
    v1Radius,
    v2Position,
    v2Radius
  },
  renderers,
  settings
}: UndirectedStraightEdgeComponentProps<V, E>) {
  // Edge line
  const p1 = useSharedValue({
    x: v1Position.x.value,
    y: v1Position.y.value
  });
  const p2 = useSharedValue({
    x: v2Position.x.value,
    y: v2Position.y.value
  });

  const v1Key = edge.vertices[0].key;
  const v2Key = edge.vertices[1].key;

  useAnimatedReaction(
    () => ({
      edgesCount: animatedEdgesCount.value,
      labelScale: settings.label?.scale.value,
      maxOffsetFactor: settings.edge.maxOffsetFactor.value,
      order: animatedOrder.value,
      r1: v1Radius.value,
      r2: v2Radius.value,
      v1: { x: v1Position.x.value, y: v1Position.y.value },
      v2: { x: v2Position.x.value, y: v2Position.y.value }
    }),
    ({ edgesCount, labelScale, maxOffsetFactor, order, r1, r2, v1, v2 }) => {
      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first on the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        [v1, v2] = [v2, v1];
      }
      const calcOffset = calcTranslationOffset.bind(
        null,
        order,
        edgesCount,
        maxOffsetFactor
      );

      const p1Offset = calcOffset(r1);
      const p2Offset = calcOffset(r2);

      const dirVector = calcOrthogonalUnitVector(v1, v2);
      const p1Translation = multiplyVector(dirVector, p1Offset);
      const p2Translation = multiplyVector(dirVector, p2Offset);
      // Update edge line points positions
      p1.value = addVectors(v1, p1Translation);
      p2.value = addVectors(v2, p2Translation);
      // Update edge label max size
      const maxSize =
        (maxOffsetFactor * (r1 + r2)) / (edgesCount > 0 ? edgesCount - 1 : 1);
      const avgRadius = (r1 + r2) / 2;
      if (labelScale) {
        labelHeight.value = Math.min(maxSize, labelScale * avgRadius);
      }
      // Update label position
      labelPosition.x.value = (p1.value.x + p2.value.x) / 2;
      labelPosition.y.value = (p1.value.y + p2.value.y) / 2;
    }
  );

  return renderers.edge({
    animationProgress,
    key: edge.key,
    p1,
    p2,
    value: edge.value
  });
}

export default memo(
  UndirectedStraightEdgeComponent
) as typeof UndirectedStraightEdgeComponent;
