import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';

import GraphComponent, { GraphComponentPrivateProps } from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = {
  graph: UndirectedGraph<V, E>;
  settings?: UndirectedGraphSettings<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
};

function UndirectedGraphComponent<V, E>(
  props: UndirectedGraphComponentProps<V, E> & GraphComponentPrivateProps<V, E>
) {
  return <GraphComponent {...props} />;
}

export default <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
  return (
    <UndirectedGraphComponent
      {...(props as UndirectedGraphComponentProps<V, E> &
        GraphComponentPrivateProps<V, E>)}
    />
  );
};
