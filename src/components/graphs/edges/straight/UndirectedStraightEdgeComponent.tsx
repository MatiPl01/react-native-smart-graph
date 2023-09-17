import { memo } from 'react';

import { UndirectedStraightEdgeComponentProps } from '@/types/components';

import StraightEdgeComponent from './StraightEdgeComponent';
import { TranslationOffsetGetter, useStraightEdge } from './utils';

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

function UndirectedStraightEdgeComponent<V, E>(
  props: UndirectedStraightEdgeComponentProps<V, E>
) {
  const {
    data: { animationProgress, key, value },
    focusProgress,
    renderers
  } = props;

  const { p1, p2 } = useStraightEdge(props, calcTranslationOffset);

  return (
    <StraightEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      focusProgress={focusProgress}
      p1={p1}
      p2={p2}
      renderer={renderers.edge}
      value={value as E}
    />
  );
}

export default memo(
  UndirectedStraightEdgeComponent
) as typeof UndirectedStraightEdgeComponent;
