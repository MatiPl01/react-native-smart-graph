import { EasingFunctionFactory } from 'react-native-reanimated';

import { DirectedGraph, UndirectedGraph } from '..';
import { DirectedEdgeData, UndirectedEdgeData } from './data';

export type AnimationSettings = {
  duration?: number;
  easing?: EasingFunctionFactory;
  onComplete?: () => void;
};

export type AnimationSettingWithDefaults = Required<AnimationSettings>;

export type TimelineAnimationSettings = {
  easing: EasingFunctionFactory;
  onComplete?: () => void;
};

export type EdgeDataType<V, E, G> = G extends DirectedGraph<V, E>
  ? DirectedEdgeData<E>
  : G extends UndirectedGraph<V, E>
  ? UndirectedEdgeData<E>
  : never;
