import { SharedValue } from 'react-native-reanimated';

export type AnimatedPosition = SharedValue<{ x: number; y: number }>;

export type AnimatedPositionCoordinates = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};
