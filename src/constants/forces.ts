import { DefaultForcesStrategySettings } from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';

export const DEFAULT_FORCES_STRATEGY_SETTINGS: DeepRequiredAll<DefaultForcesStrategySettings> =
  {
    strategy: 'default',
    attractionScale: 1,
    attractionForceFactor: 1,
    repulsionScale: 100000
  };
