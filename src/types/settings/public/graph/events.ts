import { VertexData } from '@/types/data';
import { AnimatedVectorCoordinates } from '@/types/layout';

export type VertexPressEvent<V = void> = {
  position: AnimatedVectorCoordinates;
  vertex: VertexData<V>;
};

export type VertexPressHandler<V = void> = (data: VertexPressEvent<V>) => void;

type PressEventsCallbacks<V> = {
  onVertexLongPress?: VertexPressHandler<V>;
  onVertexPress?: VertexPressHandler<V>;
};

export type GraphEventsSettings<V> = PressEventsCallbacks<V>;
