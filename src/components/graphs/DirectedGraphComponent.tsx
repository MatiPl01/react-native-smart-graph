import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';

import GraphComponent, { GraphComponentPrivateProps } from './GraphComponent';

type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  settings?: DirectedGraphSettings<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
};

function DirectedGraphComponent<V, E>(
  props: DirectedGraphComponentProps<V, E> & GraphComponentPrivateProps
) {
  return <GraphComponent {...props} />;
}

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> &
        GraphComponentPrivateProps)}
    />
  );
};
