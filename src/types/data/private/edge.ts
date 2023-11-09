import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge, EdgeObserver, UndirectedEdge } from '@/types/models';
import { AllAnimationSettings } from '@/types/settings';

import { EdgeLabelComponentData } from './edgeLabel';

export type GraphEdge<V, E> = DirectedEdge<V, E> | UndirectedEdge<V, E>;

export type EdgeComponentData<E = unknown> = {
  addObserver(observer: EdgeObserver<E>): void;
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings | null;
  isDirected: boolean;
  key: string;
  label: Omit<EdgeLabelComponentData<E>, 'animationProgress' | 'value'>;
  ordering: SharedValue<{
    source: {
      edgesCount: number;
      order: number;
    };
    target: {
      edgesCount: number;
      order: number;
    };
  }>;
  points: SharedValue<{
    v1Source: Vector;
    v1Target: Vector;
    v2Source: Vector;
    v2Target: Vector;
  }>;
  removeObserver(observer: EdgeObserver<E>): void;
  removed: boolean;
  transformProgress: SharedValue<number>;
  v1Key: string;
  v2Key: string;
  value?: E;
};

export type EdgeRemoveHandler = (key: string) => void;
