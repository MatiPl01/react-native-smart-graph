import { Easing, EasingFunctionFactory } from 'react-native-reanimated';

const EASING = {
  bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  ease: Easing.ease as unknown as EasingFunctionFactory,
  easeInOut: Easing.inOut(Easing.ease) as unknown as EasingFunctionFactory
};

export default EASING;
