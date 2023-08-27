import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { UndirectedStraightEdgeComponentProps } from '@/types/components';

import {
  getEdgeTranslation,
  getLabelTransform,
  TranslationOffsetGetter
} from './utils';

const calcTranslationOffset: TranslationOffsetGetter = (
  order,
  edgesCount,
  maxOffsetFactor,
  vertexRadius
) => {
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
    points,
    transformProgress,
    value
  },
  renderers,
  settings: {
    edge: { maxOffsetFactor },
    label: { displayed: labelDisplayed, scale: labelScale },
    vertex: { radius: vertexRadius }
  }
}: UndirectedStraightEdgeComponentProps<V, E>) {
  // EDGE RENDERER PROPS
  const p1 = useSharedValue({
    x: points.value.v1Source.x,
    y: points.value.v1Source.y
  });
  const p2 = useSharedValue({
    x: points.value.v2Source.x,
    y: points.value.v2Source.y
  });

  // HELPER VALUES
  // Offset
  const currentOffset = useSharedValue(0);
  const startOffset = useSharedValue(0);
  // Label scale
  const startScale = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      label: {
        displayed: labelDisplayed.value,
        scale: labelScale.value
      },
      offsetFactor: maxOffsetFactor.value,
      points: points.value,
      progress: transformProgress.value,
      r: vertexRadius.value
    }),
    props => {
      // Update the source offset if the new transition started
      let beginOffset = startOffset.value;
      if (props.progress === 0) {
        beginOffset = startOffset.value = currentOffset.value;
      }
      // Get translated edge data
      const res = getEdgeTranslation(
        calcTranslationOffset,
        beginOffset,
        ordering.value,
        props
      );
      p1.value = res.p1;
      p2.value = res.p2;
      currentOffset.value = res.offset;
      // Update label data (if it is displayed)
      if (props.label.displayed) {
        let beginScale = startScale.value;
        if (props.progress === 0) {
          beginScale = startScale.value = labelData.transform.value.scale;
        }
        labelData.transform.value = getLabelTransform(
          res,
          beginScale,
          ordering.value,
          props
        );
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
