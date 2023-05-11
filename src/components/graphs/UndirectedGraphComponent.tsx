import { ForwardedRef, forwardRef } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';

import GraphComponent, {
  GraphComponentHandlers,
  GraphComponentPrivateProps
} from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = {
  graph: UndirectedGraph<V, E>;
  settings?: UndirectedGraphSettings<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
};

export default forwardRef(function UndirectedGraphComponent<V, E>(
  {
    ...props
  }: UndirectedGraphComponentProps<V, E> & GraphComponentPrivateProps,
  ref: ForwardedRef<GraphComponentHandlers>
) {
  return <GraphComponent ref={ref} {...props} />;
}) as unknown as <V, E>(
  props: UndirectedGraphComponentProps<V, E>
) => JSX.Element;
