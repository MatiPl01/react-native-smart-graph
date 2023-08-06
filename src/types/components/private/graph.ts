import { SharedValue } from 'react-native-reanimated';

import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';
import {
  EdgeComponentData,
  EdgeRemoveHandler,
  LabelComponentData,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/data';
import { BoundingRect } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  DirectedGraphSettings,
  DirectedGraphWithCurvedEdgeSettings,
  GraphEventsSettings,
  InternalAllGraphLayoutSettings,
  InternalAllGraphPlacementSettings,
  InternalDirectedGraphWithCurvedEdgesComponentsSettings,
  InternalDirectedGraphWithStraightEdgesComponentsSettings,
  InternalUndirectedGraphWithCurvedEdgesComponentsSettings,
  InternalUndirectedGraphWithStraightEdgesComponentsSettings,
  UndirectedGraphSettings,
  UndirectedGraphWithCurvedEdgeSettings
} from '@/types/settings';
import { DeepUnsharedify } from '@/types/utils';

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
  edgesData: Record<string, EdgeComponentData<V, E>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

/*
 * INTERNAL GRAPH SETTINGS
 */
type SharedInternalGraphSettings<V> = {
  animations: AllGraphAnimationsSettings;
  events?: GraphEventsSettings<V>;
  layout: InternalAllGraphLayoutSettings;
  placement: InternalAllGraphPlacementSettings;
};

type InternalUndirectedGraphWithStraightEdgeSettings<V, E> = {
  graph: UndirectedGraph<V, E>;
  renderers: UndirectedGraphWithStraightEdgeRenderers<V, E>;
  settings: SharedInternalGraphSettings<V> & {
    components: InternalUndirectedGraphWithStraightEdgesComponentsSettings;
  };
};

type InternalUndirectedGraphWithCurvedEdgeSettings<V, E> = {
  graph: UndirectedGraph<V, E>;
  renderers: UndirectedGraphWithCurvedEdgeRenderers<V, E>;
  settings: SharedInternalGraphSettings<V> & {
    components: InternalUndirectedGraphWithCurvedEdgesComponentsSettings;
  };
};

type InternalDirectedGraphWithStraightEdgeSettings<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers: DirectedGraphWithStraightEdgeRenderers<V, E>;
  settings: SharedInternalGraphSettings<V> & {
    components: InternalDirectedGraphWithStraightEdgesComponentsSettings;
  };
};

type InternalDirectedGraphWithCurvedEdgeSettings<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers: DirectedGraphWithCurvedEdgeRenderers<V, E>;
  settings: SharedInternalGraphSettings<V> & {
    components: InternalDirectedGraphWithCurvedEdgesComponentsSettings;
  };
};

export type GraphSettingsData<V, E> =
  | InternalDirectedGraphWithCurvedEdgeSettings<V, E>
  | InternalDirectedGraphWithStraightEdgeSettings<V, E>
  | InternalUndirectedGraphWithCurvedEdgeSettings<V, E>
  | InternalUndirectedGraphWithStraightEdgeSettings<V, E>;

/*
 * DEFAULT GRAPH SETTINGS
 */
export type AllGraphSettingsData<V, E> = DeepUnsharedify<
  GraphSettingsData<V, E>
>;
