import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { VertexObserver } from '@/types/models/public/observer';
import { AllAnimationSettings } from '@/types/settings/private/graph/animations';

import { VertexLabelComponentData } from './vertexLabel';

export type VertexComponentData<V = unknown> = {
  addObserver(observer: VertexObserver<V>): void;
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings | null;
  focusProgress: SharedValue<number>;
  key: string;
  label: Pick<VertexLabelComponentData<V>, 'transform'>;
  points: SharedValue<{
    source: Vector;
    target: Vector;
  }>;
  removeObserver(observer: VertexObserver<V>): void;
  removed: boolean;
  scale: SharedValue<number>;
  transformProgress: SharedValue<number>;
  value?: V;
};

export type VertexRemoveHandler = (key: string) => void;

export type VertexTransformation = {
  scale: number;
  x: number;
  y: number;
};
