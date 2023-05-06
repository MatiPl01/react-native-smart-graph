import { SharedValue } from 'react-native-reanimated';

import { Vector } from '@shopify/react-native-skia';

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
export type AnimatedBoundingRect = {
  top: SharedValue<number>;
  bottom: SharedValue<number>;
  right: SharedValue<number>;
  left: SharedValue<number>;
};
