import { withDecay } from 'react-native-reanimated';

export const fixedWithDecay = (
  velocity: number,
  scale: number,
  [clampMin, clampMax]: [number, number]
) => {
  'worklet';
  let newVelocity = velocity;
  if (scale <= clampMin && velocity > 0) {
    newVelocity = -0.01;
  } else if (scale >= clampMax && velocity < 0) {
    newVelocity = 0.01;
  }

  return withDecay({
    velocity: newVelocity,
    clamp: [clampMin, clampMax],
    rubberBandEffect: true,
    deceleration: 0.98,
    rubberBandFactor: 3
  });
};
