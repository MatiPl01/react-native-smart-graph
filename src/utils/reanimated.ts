import { withDecay } from 'react-native-reanimated';

export const withDecayRubberBand = (
  velocity: number,
  [clampMin, clampMax]: [number, number]
) => {
  'worklet';
  return withDecay({
    clamp: [clampMin, clampMax],
    deceleration: 0.98,
    rubberBandEffect: true,
    rubberBandFactor: 2.75,
    velocity: velocity
  });
};
