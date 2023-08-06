import { GraphRenderers } from '@/types/components';
import { Graph } from '@/types/models';
import { GraphSettings } from '@/types/settings';

export type GraphData<V, E> = {
  graph: Graph<V, E>;
  renderers?: GraphRenderers<V, E>;
  settings?: GraphSettings<V>;
};
