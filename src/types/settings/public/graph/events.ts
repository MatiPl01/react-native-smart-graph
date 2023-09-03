import { VertexData } from '@/types/data';

export type VertexPressEvent<V = void> = {
  vertex: VertexData<V>;
};

export type VertexPressHandler<V = void> = (data: VertexPressEvent<V>) => void;

export type PressEventsSettings<V> = {
  disableAnimation?: boolean;
  onVertexLongPress?: VertexPressHandler<V>;
  onVertexPress?: VertexPressHandler<V>;
};

export type GraphEventsSettings<V> = {
  press?: PressEventsSettings<V>;
};
