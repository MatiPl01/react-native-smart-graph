/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharedValue } from 'react-native-reanimated';

import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import {
  CurvedEdgeRenderer,
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  EdgeArrowRenderer,
  StraightEdgeRenderer,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components';
import {
  EdgeLabelRenderer,
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
import { MaybeObject, RendererWithProps } from '@/types/utils';

/*
 * COMPONENTS PROPS
 */
export type DirectedGraphComponentProps<
  V,
  E,
  VR extends VertexRenderer<V, any>,
  VLR extends VertexLabelRenderer<V, any>,
  VMR extends VertexMaskRenderer<any>,
  ER extends CurvedEdgeRenderer<E, any> | StraightEdgeRenderer<E, any>,
  ELR extends EdgeLabelRenderer<E, any>,
  EAR extends EdgeArrowRenderer<any>,
  ET extends EdgeType
> = Omit<DirectedGraphSettings<V>, 'edgeType'> & {
  edgeType?: ET;
  graph: DirectedGraph<V, E>;
  renderers?: ET extends 'curved'
    ? MaybeObject<
        DirectedGraphWithCurvedEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR>
      >
    : MaybeObject<
        DirectedGraphWithStraightEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR>
      >;
};

export type UndirectedGraphComponentProps<
  V,
  E,
  VR extends VertexRenderer<V, any>,
  VLR extends VertexLabelRenderer<V, any>,
  VMR extends VertexMaskRenderer<any>,
  ER extends CurvedEdgeRenderer<E, any> | StraightEdgeRenderer<E, any>,
  ELR extends EdgeLabelRenderer<E, any>,
  ET extends EdgeType
> = Omit<UndirectedGraphSettings<V>, 'edgeType'> & {
  edgeType?: ET;
  graph: UndirectedGraph<V, E>;
  renderers?: ET extends 'curved'
    ? MaybeObject<
        UndirectedGraphWithCurvedEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR>
      >
    : MaybeObject<
        UndirectedGraphWithStraightEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR>
      >;
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
    edge:
      | RendererWithProps<CurvedEdgeRenderer<E>>
      | RendererWithProps<StraightEdgeRenderer<E>>
      | null;
    edgeArrow: RendererWithProps<EdgeArrowRenderer> | null;
    edgeLabel: RendererWithProps<EdgeLabelRenderer<E>> | null;
    vertex: RendererWithProps<VertexRenderer<V>> | null;
    vertexLabel: RendererWithProps<VertexLabelRenderer<V>> | null;
    vertexMask: RendererWithProps<VertexMaskRenderer> | null;
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
