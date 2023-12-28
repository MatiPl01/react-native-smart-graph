import {
  CurvedEdgeRenderer,
  EdgeArrowRenderer,
  EdgeLabelRenderer,
  StraightEdgeRenderer,
  VertexLabelRenderer,
  VertexMaskRenderer,
  VertexRenderer
} from '@/types/components';
import { Graph } from '@/types/models';
import {
  EdgeArrowSettings,
  EdgeLabelSettings,
  EdgeSettings,
  GraphSettings,
  VertexSettings
} from '@/types/settings';
import { MaybeObject, OptionalPropsRenderer } from '@/types/utils';

export type GraphData<V, E> = Omit<GraphSettings<V>, 'componentsSettings'> & {
  componentsSettings?: {
    edge?: EdgeSettings;
    edgeArrow?: EdgeArrowSettings;
    edgeLabel?: EdgeLabelSettings;
    vertex?: VertexSettings;
  };
  graph: Graph<V, E>;
  renderers?: MaybeObject<{
    edge:
      | OptionalPropsRenderer<CurvedEdgeRenderer<E>>
      | OptionalPropsRenderer<StraightEdgeRenderer<E>>
      | null;
    edgeArrow: OptionalPropsRenderer<EdgeArrowRenderer> | null;
    edgeLabel: OptionalPropsRenderer<EdgeLabelRenderer<E>> | null;
    vertex: OptionalPropsRenderer<VertexRenderer<V>> | null;
    vertexLabel: OptionalPropsRenderer<VertexLabelRenderer<V>> | null;
    vertexMask: OptionalPropsRenderer<VertexMaskRenderer> | null;
  }>;
};
