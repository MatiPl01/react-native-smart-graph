/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { Edge } from '@/types/models';
import { AllAnimationSettings } from '@/types/settings/private/graph/animations';

export type EdgeComponentData<V, E> = {
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings;
  displayed: SharedValue<boolean>;
  edge: Edge<V, E>;
  edgesCount: SharedValue<number>;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  order: SharedValue<number>;
  removed: boolean;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type EdgeRemoveHandler = (key: string) => void;
