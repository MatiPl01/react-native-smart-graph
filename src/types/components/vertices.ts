import { SharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettingsWithDefaults
} from '@/types/settings';

export type VertexComponentData<V, E> = {
  vertex: Vertex<V, E>;
  removed: boolean;
  componentSettings: VertexSettingsWithDefaults;
  animationSettings: AnimationSettingsWithDefaults;
  renderer: VertexRenderFunction<V>;
};

export type VertexComponentRenderData = {
  scale: SharedValue<number>;
  position: AnimatedVectorCoordinates;
  currentRadius: SharedValue<number>;
};

export type VertexRenderHandler = (
  key: string,
  renderData: VertexComponentRenderData
) => void;

export type VertexRemoveHandler = (key: string) => void;
