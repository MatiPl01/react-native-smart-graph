import { memo } from 'react';

import { UndirectedCurvedEdgeComponentProps } from '@/types/components';

import CurvedEdgeComponent from './CurvedEdgeComponent';
import { EdgePointsOrderGetter, useCurvedEdge } from './utils';

const getEdgePointsOrder: EdgePointsOrderGetter = (v1Key, v2Key) => {
  'worklet';
  return v1Key.localeCompare(v2Key);
};

function UndirectedCurvedEdgeComponent<V, E>(
  props: UndirectedCurvedEdgeComponentProps<V, E>
) {
  const {
    data: { animationProgress, key, value },
    focusProgress,
    renderers
  } = props;

  const { path } = useCurvedEdge(props, getEdgePointsOrder);

  return (
    <CurvedEdgeComponent
      animationProgress={animationProgress}
      edgeKey={key}
      focusProgress={focusProgress}
      path={path}
      renderer={renderers.edge}
      value={value as E}
    />
  );
}

export default memo(
  UndirectedCurvedEdgeComponent
) as typeof UndirectedCurvedEdgeComponent;
