import { SharedValue } from 'react-native-reanimated';

import { DeepRequiredAll } from '../utils';

export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  strategy: 'default';
  forces?: {
    attraction?: {
      edges?: {
        scale?: number;
        factor?: number;
      };
      targetPositions: {
        scale?: number;
        factor?: number;
      };
    };
    repelling?: {
      vertices?: {
        scale?: number;
      };
    };
  };
};

export type DefaultForcesStrategySettingsWithDefaults =
  DeepRequiredAll<DefaultForcesStrategySettings>;

export type ForcesSettings = DefaultForcesStrategySettings;

export type ForcesSettingsWithDefaults =
  DefaultForcesStrategySettingsWithDefaults;

export type ForcesScale = {
  graph: SharedValue<number>;
  target: SharedValue<number>;
};
