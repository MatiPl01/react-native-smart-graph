import { SharedValue } from 'react-native-reanimated';

import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import {
  ArrowRenderer,
  CurvedEdgeRenderer,
  StraightEdgeRenderer
} from '@/types/components';
import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  LabelRenderer,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers,
  VertexRenderer
} from '@/types/components/public';
import {
  EdgeComponentData,
  EdgeRemoveHandler,
  LabelComponentData,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/data';
import { BoundingRect } from '@/types/layout';
import { Graph, GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  AllGraphLayoutSettings,
  AllGraphPlacementSettings,
  DirectedGraphSettings,
  DirectedGraphWithCurvedEdgeSettings,
  GraphEventsSettings,
  InternalGraphLayoutSettings,
  InternalGraphPlacementSettings,
  InternalMultiStepFocusSettings,
  MultiStepFocusSettings,
  UndirectedGraphSettings,
  UndirectedGraphWithCurvedEdgeSettings
} from '@/types/settings';
import {
  AllGraphComponentsSettings,
  InternalGraphComponentsSettings
} from '@/types/settings/private/graph/components';

/*
 * COMPONENTS PROPS
 */
export type DirectedGraphComponentProps<
  V,
  E,
  S extends DirectedGraphSettings<V>
> = {
  graph: DirectedGraph<V, E>;
  renderers?: S extends DirectedGraphWithCurvedEdgeSettings<V>
    ? DirectedGraphWithCurvedEdgeRenderers<V, E>
    : DirectedGraphWithStraightEdgeRenderers<V, E>;
  settings?: S;
};

export type UndirectedGraphComponentProps<
  V,
  E,
  S extends UndirectedGraphSettings<V>
> = {
  graph: UndirectedGraph<V, E>;
  renderers?: S extends UndirectedGraphWithCurvedEdgeSettings<V>
    ? UndirectedGraphWithCurvedEdgeRenderers<V, E>
    : UndirectedGraphWithStraightEdgeRenderers<V, E>;
  settings?: S;
};

export type GraphComponentsData<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<E>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V>>;
};

/*
 * DEFAULT GRAPH SETTINGS
 */
export type AllGraphSettings<V, E> = {
  graph: Graph<V, E>;
  renderers: {
    arrow?: ArrowRenderer;
    edge: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E>;
    label?: LabelRenderer<E>;
    vertex: VertexRenderer<V>;
  };
  settings: {
    animations: AllGraphAnimationsSettings;
    components: AllGraphComponentsSettings;
    events?: GraphEventsSettings<V>;
    focus?: MultiStepFocusSettings;
    layout: AllGraphLayoutSettings;
    placement: AllGraphPlacementSettings;
  };
};

/*
 * INTERNAL GRAPH SETTINGS
 */
export type GraphSettingsData<V, E> = Omit<
  AllGraphSettings<V, E>,
  'settings'
> & {
  settings: Pick<
    AllGraphSettings<V, E>['settings'],
    'animations' | 'events'
  > & {
    components: InternalGraphComponentsSettings;
    focus?: InternalMultiStepFocusSettings;
    layout: InternalGraphLayoutSettings;
    placement: InternalGraphPlacementSettings;
  };
};
