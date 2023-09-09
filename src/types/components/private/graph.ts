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
import { Graph, GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  AllGraphLayoutSettings,
  AllGraphPlacementSettings,
  AllMultiStepFocusSettings,
  DirectedGraphSettings,
  EdgeType,
  GraphEventsSettings,
  InternalGraphEventsSettings,
  InternalGraphLayoutSettings,
  InternalGraphPlacementSettings,
  InternalMultiStepFocusSettings,
  UndirectedGraphSettings
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
  ET extends EdgeType = 'straight'
> = Omit<DirectedGraphSettings<V>, 'edgeType'> & {
  edgeType?: ET;
  graph: DirectedGraph<V, E>;
  renderers?: ET extends 'curved'
    ? DirectedGraphWithCurvedEdgeRenderers<V, E>
    : DirectedGraphWithStraightEdgeRenderers<V, E>;
};

export type UndirectedGraphComponentProps<
  V,
  E,
  ET extends EdgeType = 'straight'
> = Omit<UndirectedGraphSettings<V>, 'componentSettings'> & {
  edgeType?: ET;
  graph: UndirectedGraph<V, E>;
  renderers?: ET extends 'curved'
    ? UndirectedGraphWithCurvedEdgeRenderers<V, E>
    : UndirectedGraphWithStraightEdgeRenderers<V, E>;
};

export type GraphComponentsData<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<E>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  verticesData: Record<string, VertexComponentData<V>>;
};

/*
 * DEFAULT GRAPH SETTINGS
 */
export type AllGraphSettings<V, E> = {
  animationSettings: AllGraphAnimationsSettings;
  componentSettings: AllGraphComponentsSettings;
  edgeType: EdgeType;
  eventSettings?: GraphEventsSettings<V>;
  focusSettings?: AllMultiStepFocusSettings;
  graph: Graph<V, E>;
  layoutSettings: AllGraphLayoutSettings;
  placementSettings: AllGraphPlacementSettings;
  renderers: {
    arrow?: ArrowRenderer;
    edge: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E>;
    label?: LabelRenderer<E>;
    vertex: VertexRenderer<V>;
  };
};

/*
 * INTERNAL GRAPH SETTINGS
 */
export type GraphSettingsData<V, E> = Pick<
  AllGraphSettings<V, E>,
  'edgeType' | 'graph' | 'renderers'
> & {
  animationSettings: AllGraphSettings<V, E>['animationSettings'];
  componentSettings: InternalGraphComponentsSettings;
  eventSettings?: InternalGraphEventsSettings<V>;
  focusSettings?: InternalMultiStepFocusSettings;
  layoutSettings: InternalGraphLayoutSettings;
  placementSettings: InternalGraphPlacementSettings;
};
