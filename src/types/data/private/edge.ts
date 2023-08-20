/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { DirectedEdge, UndirectedEdge } from '@/types/models';
import { AllAnimationSettings } from '@/types/settings';

export type GraphEdge<V, E> = DirectedEdge<V, E> | UndirectedEdge<V, E>;

export type EdgeComponentData<E> = {
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings;
  displayed: SharedValue<boolean>;
  edgesCount: SharedValue<number>;
  isDirected: boolean;
  key: string;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  order: SharedValue<number>;
  removed: boolean;
  v1Key: string;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Key: string;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
  value?: E;
};

export type EdgeRemoveHandler = (key: string) => void;
