import { SharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettingsWithDefaults
} from '@/types/settings';

export type VertexComponentData<V, E> = {
  animationSettings: AnimationSettingsWithDefaults;
  componentSettings: VertexSettingsWithDefaults;
  removed: boolean;
  renderer: VertexRenderFunction<V>;
  vertex: Vertex<V, E>;
};

export type VertexComponentRenderData = {
  currentRadius: SharedValue<number>;
  position: AnimatedVectorCoordinates;
  scale: SharedValue<number>;
};

export type VertexRenderHandler = (
  key: string,
  renderData: VertexComponentRenderData
) => void;

export type VertexRemoveHandler = (key: string) => void;
