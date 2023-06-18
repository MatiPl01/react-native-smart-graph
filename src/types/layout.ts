import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

// Vectors
export type AnimatedVector = SharedValue<Vector>;

export type AnimatedVectorCoordinates = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

// Dimensions
export type Dimensions = {
  height: number;
  width: number;
};

// Bounding rect
export type BoundingRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type AnimatedBoundingRect = {
  bottom: SharedValue<number>;
  left: SharedValue<number>;
  right: SharedValue<number>;
  top: SharedValue<number>;
};

export type AnimatedPath = SharedValue<string>;
