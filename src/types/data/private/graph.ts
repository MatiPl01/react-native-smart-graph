import { GraphRenderers } from '@/types/components';
import { Edge, Graph } from '@/types/models';
import { GraphSettings } from '@/types/settings';

export type GraphData<V, E, GE extends Edge<V, E>> = {
  graph: Graph<V, E, GE>;
  renderers?: GraphRenderers<V, E>;
  settings?: GraphSettings<V>;
};
