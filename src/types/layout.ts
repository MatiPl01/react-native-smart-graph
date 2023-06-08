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
  width: number;
  height: number;
};

export type AnimatedDimensions = {
  width: SharedValue<number>;
  height: SharedValue<number>;
};

// Bounding rect
export type BoundingRect = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type AnimatedBoundingRect = {
  top: SharedValue<number>;
  bottom: SharedValue<number>;
  right: SharedValue<number>;
  left: SharedValue<number>;
};

// Others
export type RelativeVerticesOrder = Record<
  string,
  {
    prev?: string;
    next?: string;
    position: number;
  }
>;

export type AnimatedPath = SharedValue<string>;
