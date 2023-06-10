import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettingsWithDefaults
} from '@/types/settings';

export type GraphVertexData<V, E> = {
  vertex: Vertex<V, E>;
  removed: boolean;
  targetPosition: Vector;
  animatedPosition: AnimatedVectorCoordinates;
  currentRadius: SharedValue<number>;
  componentSettings: VertexSettingsWithDefaults;
  animationSettings: AnimationSettingsWithDefaults;
  renderer: VertexRenderFunction<V>;
};

export type VertexRenderHandler = (
  key: string,
  animatedValues: {
    position: AnimatedVectorCoordinates;
    scale: SharedValue<number>;
    currentRadius: SharedValue<number>;
  }
) => void;

export type VertexRemoveHandler = (key: string) => void;
