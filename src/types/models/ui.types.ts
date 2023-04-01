import { SharedValue } from 'react-native-reanimated';

import { GraphEdge, GraphVertex } from './graphs';

export interface UIVertex<V, E, GV extends GraphVertex<V, E>> {
  get vertex(): GV;
  get x(): SharedValue<number>;
  get y(): SharedValue<number>;
}

export interface UIEdge<E, V, GE extends GraphEdge<E, V>> {
  // TODO - add more properties
  get edge(): GE;
}
