import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { UndirectedStraightEdgeComponentProps } from '@/types/components';
import { animateToValue } from '@/utils/animations';
import {
  addVectors,
  calcOrthogonalUnitVector,
  multiplyVector
} from '@/utils/vectors';

import RenderedStraightEdgeComponent from './RenderedStraightEdgeComponent';

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
  data: {
    animationProgress,
    animationSettings,
    edgesCount,
    key,
    labelHeight,
    labelPosition,
    order,
    v1Key,
    v1Position: { x: v1x, y: v1y },
    v1Radius,
    v2Key,
    v2Position: { x: v2x, y: v2y },
    v2Radius,
    value
  },
  renderers,
  settings
}: UndirectedStraightEdgeComponentProps<V, E>) {
  const animated = !!animationSettings;
  const {
    edge: { maxOffsetFactor },
    label: { scale: labelScale }
  } = settings;

  // Edge
  const p1 = useSharedValue({ x: v1x.value, y: v1y.value });
  const p2 = useSharedValue({ x: v2x.value, y: v2y.value });
  const targetOffset = useSharedValue(0);
  const offset = useSharedValue(0);

  // Edge offset
  const isFirstReaction = useSharedValue(true);
  useAnimatedReaction(
    () => ({
      edgesCount: edgesCount.value,
      maxOffsetFactor: maxOffsetFactor.value,
      order: order.value,
      r1: v1Radius.value,
      r2: v2Radius.value
    }),
    ({ r1, r2, ...s }) => {
      const target = targetOffset.value = calcTranslationOffset(
        s.order,
        s.edgesCount,
        s.maxOffsetFactor,
        Math.min(r1, r2)
      );

      if (isFirstReaction.value) {
        p1Offset.value = p1TargetOffset.value;
        p2Offset.value = p2TargetOffset.value;
        isFirstReaction.value = false;
      }
    }
  );

  useAnimatedReaction(
    () => ({
      current: p1Offset.value,
      target: p1TargetOffset.value
    }),
    ({ current, target }) => {
      p1Offset.value = animated
        ? animateToValue(current, target, 0.1, 100)
        : target;
    }
  );

  useAnimatedReaction(
    () => ({
      current: p2Offset.value,
      target: p2TargetOffset.value
    }),
    ({ current, target }) => {
      p2Offset.value = animated
        ? animateToValue(current, target, 0.1, 100)
        : target;
    }
  );

  // Edge
  useAnimatedReaction(
    () => ({
      edgesCount: edgesCount.value,
      labelScale: labelScale.value,
      maxOffsetFactor: maxOffsetFactor.value,
      p1Offset: p1Offset.value,
      p2Offset: p2Offset.value,
      r1: v1Radius.value,
      r2: v2Radius.value,
      v1: { x: v1x.value, y: v1y.value },
      v2: { x: v2x.value, y: v2y.value }
    }),
    ({ r1, r2, v1, v2, ...s }) => {
      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first on the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        [v1, v2] = [v2, v1];
      }
      const dirVector = calcOrthogonalUnitVector(v1, v2);
      const p1Translation = multiplyVector(dirVector, s.p1Offset);
      const p2Translation = multiplyVector(dirVector, s.p2Offset);
      // Update edge line points positions
      p1.value = addVectors(v1, p1Translation);
      p2.value = addVectors(v2, p2Translation);
      // Update edge label max size
      const maxSize =
        (s.maxOffsetFactor * (r1 + r2)) /
        (s.edgesCount > 0 ? s.edgesCount - 1 : 1);
      const avgRadius = (r1 + r2) / 2;
      if (labelScale) {
        labelHeight.value = Math.min(maxSize, s.labelScale * avgRadius);
      }
      // Update label position
      labelPosition.x.value = (p1.value.x + p2.value.x) / 2;
      labelPosition.y.value = (p1.value.y + p2.value.y) / 2;
    }
  );

  return (
    <RenderedStraightEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      p1={p1}
      p2={p2}
      renderer={renderers.edge}
      value={value}
    />
  );
}

export default memo(
  UndirectedStraightEdgeComponent
) as typeof UndirectedStraightEdgeComponent;
