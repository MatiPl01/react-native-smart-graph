import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge, UndirectedEdge } from '@/types/models';
import { AllAnimationSettings } from '@/types/settings';

import { LabelComponentData } from './label';

export type GraphEdge<V, E> = DirectedEdge<V, E> | UndirectedEdge<V, E>;

export type EdgeComponentData<E> = {
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings | null;
  isDirected: boolean;
  key: string;
  label: Omit<LabelComponentData<E>, 'animationProgress' | 'value'>;
  ordering: SharedValue<{
    edgesCount: number;
    order: number;
  }>;
  removed: boolean;
  transform: {
    points: SharedValue<{
      v1Source: Vector;
      v1Target: Vector;
      v2Source: Vector;
      v2Target: Vector;
    }>;
    progress: SharedValue<number>;
  };
  v1Key: string;
  v2Key: string;
  value?: E;
};

export type EdgeRemoveHandler = (key: string) => void;
