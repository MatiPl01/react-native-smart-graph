import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';
import { RequiredWithout } from '@/types/utils';

export type AllDirectedGraphWithStraightEdgeRenderers<V, E> = RequiredWithout<
  DirectedGraphWithStraightEdgeRenderers<V, E>,
  'edgeLabel'
>;

export type AllDirectedGraphWithCurvedEdgeRenderers<V, E> = RequiredWithout<
  DirectedGraphWithCurvedEdgeRenderers<V, E>,
  'edgeLabel'
>;

export type AllUndirectedGraphWithStraightEdgeRenderers<V, E> = RequiredWithout<
  UndirectedGraphWithStraightEdgeRenderers<V, E>,
  'edgeLabel'
>;

export type AllUndirectedGraphWithCurvedEdgeRenderers<V, E> = RequiredWithout<
  UndirectedGraphWithCurvedEdgeRenderers<V, E>,
  'edgeLabel'
>;
