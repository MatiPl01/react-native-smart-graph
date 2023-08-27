import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { UndirectedStraightEdgeComponentProps } from '@/types/components';
import {
  addVectors,
  calcOrthogonalVector,
  calcUnitVector,
  getLineCenter,
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
  const edgesPerSide = (edgesCount - 1) / 2;
  return edgesCount > 1
    ? (maxTranslationOffset * (order - edgesPerSide)) / edgesPerSide
    : 0;
};

function UndirectedStraightEdgeComponent<V, E>({
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
    edge: { maxOffsetFactor },
    label: { displayed: labelDisplayed, scale: labelScale },
    vertex: { radius: vertexRadius }
  }
}: UndirectedStraightEdgeComponentProps<V, E>) {
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
    ({
      label,
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
      const v1Transl = addVectors(v1, translationVector);
      const v2Transl = addVectors(v2, translationVector);
      p1.value = v1Transl;
      p2.value = v2Transl;

      // Update label data (if displayed)
      if (label.displayed) {
        labelData.transform.value = {
          center: getLineCenter(v1Transl, v2Transl),
          p1: v1,
          p2: v2,
          scale: Math.min(
            (2 * offsetFactor) / (edgesCount > 0 ? edgesCount - 1 : 1),
            label.scale
          )
        };
      }
    }
  );

  return renderers.edge({
    animationProgress,
    key,
    p1,
    p2,
    value
  });
}

export default memo(
  UndirectedStraightEdgeComponent
) as typeof UndirectedStraightEdgeComponent;
