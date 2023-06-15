export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  strategy: 'default';
  attractionScale?: number;
  attractionForceFactor?: number;
  repulsionScale?: number;
};

export type ForcesSettings = DefaultForcesStrategySettings;
