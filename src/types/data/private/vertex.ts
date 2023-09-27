/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { AllAnimationSettings } from '@/types/settings/private/graph/animations';

import { VertexLabelComponentData } from './vertexLabel';

export type VertexComponentData<V = undefined> = {
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings | null;
  key: string;
  label: Omit<VertexLabelComponentData<V>, 'animationProgress' | 'value'>;
  points: SharedValue<{
    source: Vector;
    target: Vector;
  }>;
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
