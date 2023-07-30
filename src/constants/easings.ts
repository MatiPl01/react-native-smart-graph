import { Easing } from 'react-native-reanimated';

const EASING = {
  bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  ease: Easing.ease,
  easeInOut: Easing.inOut(Easing.ease)
};

export default EASING;
