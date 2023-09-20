import { GraphRenderers } from '@/types/components';
import { Graph } from '@/types/models';
import {
  EdgeArrowSettings,
  EdgeLabelSettings,
  EdgeSettings,
  GraphSettings,
  VertexSettings
} from '@/types/settings';
import { MaybeObject } from '@/types/utils';

export type GraphData<V, E> = Omit<GraphSettings<V>, 'componentsSettings'> & {
  componentsSettings?: {
    edge?: EdgeSettings;
    edgeArrow?: EdgeArrowSettings;
    edgeLabel?: EdgeLabelSettings;
    vertex?: VertexSettings;
  };
  graph: Graph<V, E>;
  renderers?: MaybeObject<GraphRenderers<V, E>>;
};
