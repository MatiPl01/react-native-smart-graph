import { Vector } from '@shopify/react-native-skia';

export type ForcesStrategy = 'default';

export type DefaultForcesStrategySettings = {
  strategy: 'default';
  attractionForce?: {
    attractionScale?: number;
    attractionForceFactor?: number;
  };
  repellingForce?: {
    repulsionScale?: number;
  };
};

export type ForcesSettings = DefaultForcesStrategySettings;

export type CalculatedForces = {
  attractionForces: Record<string, Vector>;
  repellingForces: Record<string, Vector>;
};
