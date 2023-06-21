import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type AnimatedVector = SharedValue<Vector>;

export type AnimatedVectorCoordinates = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export type Dimensions = {
  height: number;
  width: number;
};

export type AnimatedDimensions = {
  height: SharedValue<number>;
  width: SharedValue<number>;
};

export type BoundingRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type BoundingVertices = {
  bottom?: string;
  left?: string;
  right?: string;
  top?: string;
};

export type AnimatedBoundingRect = {
  bottom: SharedValue<number>;
  left: SharedValue<number>;
  right: SharedValue<number>;
  top: SharedValue<number>;
};

export type AnimatedPath = SharedValue<string>;
