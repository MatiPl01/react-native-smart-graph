import { SharedValue } from 'react-native-reanimated';

export type AnimatedCanvasTransform = {
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
};
