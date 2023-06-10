import { DeepRequiredAll } from '@/types/utils';

export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  strategy: 'default';
  attractionScale?: number;
  attractionForceFactor?: number;
  repulsionScale?: number;
};

export type ForcesSettings = DefaultForcesStrategySettings;

export type DefaultForcesStrategySettingsWithDefaults =
  DeepRequiredAll<DefaultForcesStrategySettings>;

export type ForcesSettingsWithDefaults =
  DefaultForcesStrategySettingsWithDefaults;
