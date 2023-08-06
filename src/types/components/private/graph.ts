import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';
import {
  DirectedGraphSettings,
  DirectedGraphWithCurvedEdgeSettings,
  UndirectedGraphSettings,
  UndirectedGraphWithCurvedEdgeSettings
} from '@/types/settings';

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
