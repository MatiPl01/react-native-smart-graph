import { withDecay } from 'react-native-reanimated';

export const fixedWithDecay = (
  velocity: number,
  scale: number,
  [clampMin, clampMax]: [number, number]
) => {
  'worklet';
  let newVelocity = velocity;
  if (scale <= clampMin && velocity >= 0) {
    newVelocity = -0.01;
  } else if (scale >= clampMax && velocity <= 0) {
    newVelocity = 0.01;
  }

  return withDecay({
    clamp: [clampMin, clampMax],
    deceleration: 0.98,
    rubberBandEffect: true,
    rubberBandFactor: 2.75,
    velocity: newVelocity
  });
};
