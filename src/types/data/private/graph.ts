import { GraphRenderers } from '@/types/components';
import { Graph } from '@/types/models';
import {
  ArrowSettings,
  EdgeSettings,
  GraphSettings,
  LabelSettings,
  VertexSettings
} from '@/types/settings';

export type GraphData<V, E> = {
  graph: Graph<V, E>;
  renderers?: GraphRenderers<V, E>;
  settings?: Omit<GraphSettings<V>, 'components'> & {
    components?: {
      arrow?: ArrowSettings;
      edge?: EdgeSettings;
      label?: LabelSettings;
      vertex?: VertexSettings;
    };
  };
};
