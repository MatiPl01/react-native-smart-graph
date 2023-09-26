import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';
import { RequiredWithout } from '@/types/utils';

export type AllDirectedGraphWithStraightEdgeRenderers<V, E> = RequiredWithout<
  DirectedGraphWithStraightEdgeRenderers<V, E>,
  'label'
>;

export type AllDirectedGraphWithCurvedEdgeRenderers<V, E> = RequiredWithout<
  DirectedGraphWithCurvedEdgeRenderers<V, E>,
  'label'
>;

export type AllUndirectedGraphWithStraightEdgeRenderers<V, E> = RequiredWithout<
  UndirectedGraphWithStraightEdgeRenderers<V, E>,
  'label'
>;

export type AllUndirectedGraphWithCurvedEdgeRenderers<V, E> = RequiredWithout<
  UndirectedGraphWithCurvedEdgeRenderers<V, E>,
  'label'
>;
