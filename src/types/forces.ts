export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  strategy: 'default';
  attractionForce?: {
    attractionScale?: number;
    attractionForceFactor?: number;
  };
  repulsiveForce?: {
    repulsionScale?: number;
  };
};

export type ForcesSettings = DefaultForcesStrategySettings;
