import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import { AnimatedVectorCoordinates } from '@/types/layout';

export type VertexPressEvent<V> = {
  position: AnimatedVectorCoordinates;
  vertex: VertexData<V>;
};

export type EdgePressEvent<
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  edge: ED;
  position: AnimatedVectorCoordinates;
};

export type EdgePressHandler<
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = (data: EdgePressEvent<E, ED>) => void;

export type VertexPressHandler<V> = (data: VertexPressEvent<V>) => void;

type PressEventsCallbacks<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  onEdgeLongPress?: EdgePressHandler<E, ED>;
  onEdgePress?: EdgePressHandler<E, ED>;
  onVertexLongPress?: VertexPressHandler<V>;
  onVertexPress?: VertexPressHandler<V>;
};

export type GraphEventsSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PressEventsCallbacks<V, E, ED>;
