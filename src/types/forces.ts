export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  attractionForce?: {
    attractionForceFactor?: number;
    attractionScale?: number;
  };
  repulsiveForce?: {
    repulsionScale?: number;
  };
  strategy: 'default';
};

export type ForcesSettings = DefaultForcesStrategySettings;
