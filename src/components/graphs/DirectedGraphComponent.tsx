import { ForwardedRef, forwardRef } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';

import GraphComponent, {
  GraphComponentHandlers,
  GraphComponentPrivateProps
} from './GraphComponent';

type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  settings?: DirectedGraphSettings<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
};

export default forwardRef(function DirectedGraphComponent<V, E>(
  { ...props }: DirectedGraphComponentProps<V, E> & GraphComponentPrivateProps,
  ref: ForwardedRef<GraphComponentHandlers>
) {
  return <GraphComponent ref={ref} {...props} />;
}) as unknown as <V, E>(
  props: DirectedGraphComponentProps<V, E>
) => JSX.Element;
