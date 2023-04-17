import { SharedValue } from 'react-native-reanimated';

// Positions
export type Position = {
  x: number;
  y: number;
};

export type AnimatedPosition = SharedValue<{ x: number; y: number }>;

// TODO - change AnimatedPositionCoordinates to AnimatedVector
export type AnimatedPositionCoordinates = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

// Dimensions
export type Dimensions = {
  width: number;
  height: number;
};

export type AnimatedDimensions = {
  width: SharedValue<number>;
  height: SharedValue<number>;
};

// Bounding rect
export type AnimatedBoundingRect = {
  x1: SharedValue<number>;
  x2: SharedValue<number>;
  y1: SharedValue<number>;
  y2: SharedValue<number>;
};
