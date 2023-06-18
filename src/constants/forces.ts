import { DefaultForcesStrategySettings } from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';

export const DEFAULT_FORCES_STRATEGY_SETTINGS: DeepRequiredAll<DefaultForcesStrategySettings> =
  {
    attractionForceFactor: 1,
    attractionScale: 1,
    repulsionScale: 100000,
    strategy: 'default'
  };
