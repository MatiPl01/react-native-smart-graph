import { DeepRequiredAll } from '@/types/utils';

export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  attractionForceFactor?: number;
  attractionScale?: number;
  repulsionScale?: number;
  strategy: 'default';
};

export type ForcesSettings = DefaultForcesStrategySettings;

export type DefaultForcesStrategySettingsWithDefaults =
  DeepRequiredAll<DefaultForcesStrategySettings>;

export type ForcesSettingsWithDefaults =
  DefaultForcesStrategySettingsWithDefaults;
