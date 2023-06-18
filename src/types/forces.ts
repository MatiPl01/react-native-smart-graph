export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  attractionForce?: {
    attractionForceFactor?: number;
    attractionScale?: number;
  };
  repellingForce?: {
    repulsionScale?: number;
  };
  strategy: 'default';
};

export type ForcesSettings = DefaultForcesStrategySettings;
