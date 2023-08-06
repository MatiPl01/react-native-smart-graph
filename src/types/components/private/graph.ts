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
import { Edge, Graph, GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  DirectedGraphSettings,
  DirectedGraphWithCurvedEdgeSettings,
  UndirectedGraphSettings,
  UndirectedGraphWithCurvedEdgeSettings
} from '@/types/settings';

import { AllDirectedGraphRenderers, AllGraphRenderers } from './renderers';

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

export type GraphComponentsData<V, E, GE extends Edge<V, E>> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<GE>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

export type InternalGraphSettings<V, E, GE extends Edge<V, E>> = {
  graph: Graph<V, E, GE>;
  renderers: AllDirectedGraphRenderers<V, E>;
  settings: {
    animations: AllGraphAnimationsSettings;
    components:
  };
};
