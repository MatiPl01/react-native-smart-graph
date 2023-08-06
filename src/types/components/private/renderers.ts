import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';

type AllUndirectedGraphWithStraightEdgeRenderers<V, E> = Required<
  UndirectedGraphWithStraightEdgeRenderers<V, E>
>;

type AllUndirectedGraphWithCurvedEdgeRenderers<V, E> = Required<
  UndirectedGraphWithCurvedEdgeRenderers<V, E>
>;

type AllDirectedGraphWithStraightEdgeRenderers<V, E> = Required<
  DirectedGraphWithStraightEdgeRenderers<V, E>
>;

type AllDirectedGraphWithCurvedEdgeRenderers<V, E> = Required<
  DirectedGraphWithCurvedEdgeRenderers<V, E>
>;

export type AllUndirectedGraphRenderers<V, E> =
  AllUndirectedGraphWithStraightEdgeRenderers<V, E> &
    AllUndirectedGraphWithCurvedEdgeRenderers<V, E>;

export type AllDirectedGraphRenderers<V, E> =
  AllDirectedGraphWithStraightEdgeRenderers<V, E> &
    AllDirectedGraphWithCurvedEdgeRenderers<V, E>;
