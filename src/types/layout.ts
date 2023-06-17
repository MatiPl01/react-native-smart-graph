import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type AnimatedVector = SharedValue<Vector>;

export type AnimatedVectorCoordinates = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type BoundingRect = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type BoundingVertices = {
  top?: string;
  bottom?: string;
  right?: string;
  left?: string;
};

export type AnimatedBoundingRect = {
  top: SharedValue<number>;
  bottom: SharedValue<number>;
  right: SharedValue<number>;
  left: SharedValue<number>;
};

export type AnimatedPath = SharedValue<string>;
