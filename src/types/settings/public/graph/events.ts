import { VertexData } from '@/types/data';
import { Animatable } from '@/types/utils';

export type VertexPressEvent<V = unknown> = {
  vertex: VertexData<V>;
};

export type VertexPressHandler<V = unknown> = (
  data: VertexPressEvent<V>
) => void;

export type PressEventsSettings<V> = {
  disableAnimation?: Animatable<boolean>;
  onVertexLongPress?: VertexPressHandler<V>;
  onVertexPress?: VertexPressHandler<V>;
};

export type GraphEventsSettings<V> = {
  press?: PressEventsSettings<V>;
};
