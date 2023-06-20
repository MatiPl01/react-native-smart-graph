import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import { AnimatedVectorCoordinates } from '@/types/layout';

type EdgePressHandler<
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = (data: { edge: ED; position: AnimatedVectorCoordinates }) => void;

type VertexPressHandler<V> = (data: {
  position: AnimatedVectorCoordinates;
  vertex: VertexData<V>;
}) => void;

export type PressEventsCallbacks<
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
