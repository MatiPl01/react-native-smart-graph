/* eslint-disable import/no-unused-modules */
import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { UndirectedCurvedEdgeComponentProps } from '@/types/components';
import {
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';
import { calcTranslationOnProgress } from '@/utils/views';

import RenderedCurvedEdgeComponent from './RenderedCurvedEdgeComponent';

function UndirectedCurvedEdgeComponent<V, E>({
  data: {
    animationProgress,
    key,
    label: labelData,
    ordering,
    transform: { points: transformPoints, progress: transformProgress },
    v1Key,
    v2Key,
    value
  },
  renderers,
  settings
}: UndirectedCurvedEdgeComponentProps<V, E>) {
  // EDGE RENDERER PROPS
  const path = useSharedValue('');

  useAnimatedReaction(
    () => ({
      points: transformPoints.value,
      progress: transformProgress.value,
      ordering: ordering.value
    }),
    ({ points: { v1Source, v1Target, v2Source, v2Target }, progress }) => {
      let v1 = calcTranslationOnProgress(progress, v1Source, v1Target);
      let v2 = calcTranslationOnProgress(progress, v2Source, v2Target);
      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first in the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        [v1, v2] = [v2, v1];
      }
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(v1, v2);
      const { x: parabolaX, y: parabolaY } = translateAlongVector(
        {
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2
        },
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX;
      labelPosition.y.value = parabolaY;

      // Update the edge path
      const controlPoint = {
        x: parabolaX * 2 - (v1.x + v2.x) / 2,
        y: parabolaY * 2 - (v1.y + v2.y) / 2
      };
      path.value = `M${v1.x},${v1.y} Q${controlPoint.x},${controlPoint.y} ${v2.x},${v2.y}`;
    },
    [v1Key, v2Key]
  );

  return (
    <RenderedCurvedEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      path={path}
      renderer={renderers.edge}
      value={value}
    />
  );
}

export default memo(
  UndirectedCurvedEdgeComponent
) as typeof UndirectedCurvedEdgeComponent;
