import { GraphRenderers } from '@/types/components';
import { Graph } from '@/types/models';
import {
  ArrowSettings,
  EdgeSettings,
  GraphSettings,
  LabelSettings,
  VertexSettings
} from '@/types/settings';

export type GraphData<V, E> = Omit<GraphSettings<V>, 'componentsSettings'> & {
  componentsSettings?: {
    arrow?: ArrowSettings;
    edge?: EdgeSettings;
    label?: LabelSettings;
    vertex?: VertexSettings;
  };
  graph: Graph<V, E>;
  renderers?: GraphRenderers<V, E>;
};
