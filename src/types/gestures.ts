import { Vector } from '@shopify/react-native-skia';

export type PressGesturesObserver = {
  onLongPress: (position: Vector) => void;
  onPress: (position: Vector) => void;
  onPressIn: (position: Vector) => void;
  onPressOut: (position: Vector) => void;
};
