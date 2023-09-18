import { GraphRenderers } from '@/types/components';
import { Graph } from '@/types/models';
import {
  ArrowSettings,
  EdgeSettings,
  GraphSettings,
  LabelSettings,
  VertexSettings
} from '@/types/settings';
import { MaybeObject } from '@/types/utils';

export type GraphData<V, E> = Omit<GraphSettings<V>, 'componentsSettings'> & {
  componentsSettings?: {
    arrow?: ArrowSettings;
    edge?: EdgeSettings;
    label?: LabelSettings;
    vertex?: VertexSettings;
  };
  graph: Graph<V, E>;
  renderers?: MaybeObject<GraphRenderers<V, E>>;
};
