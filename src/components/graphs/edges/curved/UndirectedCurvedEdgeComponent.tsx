import { memo } from 'react';

import RenderedEdgeComponent from '@/components/graphs/edges/RenderedEdgeComponent';
import { UndirectedCurvedEdgeComponentProps } from '@/types/components';

import { EdgePointsOrderGetter, useCurvedEdge } from './utils';

const getEdgePointsOrder: EdgePointsOrderGetter = (v1Key, v2Key) => {
  'worklet';
  return v1Key.localeCompare(v2Key);
};

function UndirectedCurvedEdgeComponent<V, E>(
  props: UndirectedCurvedEdgeComponentProps<V, E>
) {
  const {
    data: { addObserver, animationProgress, key, removeObserver, value },
    focusProgress,
    renderers
  } = props;

  const { path } = useCurvedEdge(props, getEdgePointsOrder);

  return (
    <RenderedEdgeComponent
      addObserver={addObserver}
      animationProgress={animationProgress}
      customProps={renderers.edge.props}
      edgeKey={key}
      focusProgress={focusProgress}
      path={path}
      removeObserver={removeObserver}
      renderer={renderers.edge.renderer}
      value={value as E}
    />
  );
}

export default memo(
  UndirectedCurvedEdgeComponent
) as typeof UndirectedCurvedEdgeComponent;
