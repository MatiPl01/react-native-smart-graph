import { SharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';

export type VertexComponentData<V, E> = {
  animationSettings: AnimationSettingsWithDefaults;
  currentRadius: SharedValue<number>;
  displayed: SharedValue<boolean>;
  position: AnimatedVectorCoordinates;
  removed: boolean;
  scale: SharedValue<number>;
  vertex: Vertex<V, E>;
};

export type VertexRemoveHandler = (key: string) => void;
