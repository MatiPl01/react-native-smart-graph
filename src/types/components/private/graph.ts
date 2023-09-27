import { SharedValue } from 'react-native-reanimated';

import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import {
  CurvedEdgeRenderer,
  EdgeArrowRenderer,
  StraightEdgeRenderer
} from '@/types/components';
import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  EdgeLabelRenderer,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers,
  VertexLabelRenderer,
  VertexMaskRenderer,
  VertexRenderer
} from '@/types/components/public';
import {
  EdgeComponentData,
  EdgeLabelComponentData,
  EdgeRemoveHandler,
  VertexComponentData,
  VertexLabelComponentData,
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
import { MaybeObject } from '@/types/utils';

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
    ? MaybeObject<DirectedGraphWithCurvedEdgeRenderers<V, E>>
    : MaybeObject<DirectedGraphWithStraightEdgeRenderers<V, E>>;
};

export type UndirectedGraphComponentProps<
  V,
  E,
  ET extends EdgeType = 'straight'
> = Omit<UndirectedGraphSettings<V>, 'edgeType'> & {
  edgeType?: ET;
  graph: UndirectedGraph<V, E>;
  renderers?: ET extends 'curved'
    ? MaybeObject<UndirectedGraphWithCurvedEdgeRenderers<V, E>>
    : MaybeObject<UndirectedGraphWithStraightEdgeRenderers<V, E>>;
};

export type GraphComponentsData<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  edgeLabelsRendered: SharedValue<boolean>;
  edgesData: Record<string, EdgeComponentData<E>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
  vertexLabelsRendered: SharedValue<boolean>;
  verticesData: Record<string, VertexComponentData<V>>;
};

/*
 * DEFAULT GRAPH SETTINGS
 */
export type AllGraphSettings<V, E> = {
  animationSettings: AllGraphAnimationsSettings;
  componentsSettings: AllGraphComponentsSettings;
  edgeType: EdgeType;
  eventSettings?: GraphEventsSettings<V>;
  focusSettings?: AllMultiStepFocusSettings;
  graph: Graph<V, E>;
  layoutSettings: AllGraphLayoutSettings;
  placementSettings: AllGraphPlacementSettings;
  renderers: {
    edge: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E> | null;
    edgeArrow: EdgeArrowRenderer | null;
    edgeLabel: EdgeLabelRenderer<E> | null;
    vertex: VertexRenderer<V> | null;
    vertexLabel: VertexLabelRenderer<V> | null;
    vertexMask: VertexMaskRenderer | null;
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
  componentsSettings: InternalGraphComponentsSettings;
  eventSettings?: InternalGraphEventsSettings<V>;
  focusSettings?: InternalMultiStepFocusSettings;
  layoutSettings: InternalGraphLayoutSettings;
  placementSettings: InternalGraphPlacementSettings;
};
