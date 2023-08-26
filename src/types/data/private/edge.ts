/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { DirectedEdge, UndirectedEdge } from '@/types/models';
import { AllAnimationSettings } from '@/types/settings';

export type GraphEdge<V, E> = DirectedEdge<V, E> | UndirectedEdge<V, E>;

export type EdgeComponentData<E> = {
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings | null;
  isDirected: boolean;
  key: string;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  ordering: SharedValue<{
    edgesCount: number;
    order: number;
  }>;
  removed: SharedValue<boolean>;
  transform: {
    progress: SharedValue<number>;
    v1: {
      key: string;
      points: SharedValue<{
        source: Vector;
        target: Vector;
      }>;
    };
    v2: {
      key: string;
      points: SharedValue<{
        source: Vector;
        target: Vector;
      }>;
    };
  };
  value?: E;
};

export type EdgeRemoveHandler = (key: string) => void;
