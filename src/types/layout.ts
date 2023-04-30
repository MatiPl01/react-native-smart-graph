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
  top: SharedValue<number>;
  bottom: SharedValue<number>;
  right: SharedValue<number>;
  left: SharedValue<number>;
};

export type AnimatedBoundingVertices = {
  top: SharedValue<string | null>;
  bottom: SharedValue<string | null>;
  left: SharedValue<string | null>;
  right: SharedValue<string | null>;
};
