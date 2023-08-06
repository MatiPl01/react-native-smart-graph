import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';

export type AllUndirectedGraphWithStraightEdgeRenderers<V, E> = Required<
  UndirectedGraphWithStraightEdgeRenderers<V, E>
>;

export type AllUndirectedGraphWithCurvedEdgeRenderers<V, E> = Required<
  UndirectedGraphWithCurvedEdgeRenderers<V, E>
>;

export type AllDirectedGraphWithStraightEdgeRenderers<V, E> = Required<
  DirectedGraphWithStraightEdgeRenderers<V, E>
>;

export type AllDirectedGraphWithCurvedEdgeRenderers<V, E> = Required<
  DirectedGraphWithCurvedEdgeRenderers<V, E>
>;

export type AllUndirectedGraphRenderers<V, E> =
  AllUndirectedGraphWithStraightEdgeRenderers<V, E> &
    AllUndirectedGraphWithCurvedEdgeRenderers<V, E>;

export type AllDirectedGraphRenderers<V, E> =
  AllDirectedGraphWithStraightEdgeRenderers<V, E> &
    AllDirectedGraphWithCurvedEdgeRenderers<V, E>;

export type AllGraphRenderers<V, E> =
  | AllDirectedGraphRenderers<V, E>
  | AllUndirectedGraphRenderers<V, E>;
