import { memo } from 'react';

import RenderedEdgeComponent from '@/components/graphs/edges/RenderedEdgeComponent';
import { UndirectedStraightEdgeComponentProps } from '@/types/components';

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
    data: { addObserver, animationProgress, key, removeObserver, value },
    focusProgress,
    renderers
  } = props;

  const { p1, p2 } = useStraightEdge(props, calcTranslationOffset);

  return (
    <RenderedEdgeComponent
      addObserver={addObserver}
      animationProgress={animationProgress}
      customProps={renderers.edge.props}
      edgeKey={key}
      focusProgress={focusProgress}
      p1={p1}
      p2={p2}
      removeObserver={removeObserver}
      renderer={renderers.edge.renderer}
      value={value as E}
    />
  );
}

export default memo(
  UndirectedStraightEdgeComponent
) as typeof UndirectedStraightEdgeComponent;
