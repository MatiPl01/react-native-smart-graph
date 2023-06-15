import { Easing } from 'react-native-reanimated';

const EASING = {
  linear: Easing.linear,
  ease: Easing.ease,
  bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275)
};

export default EASING;
