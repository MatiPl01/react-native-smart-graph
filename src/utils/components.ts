import { runOnJS, SharedValue, withTiming } from 'react-native-reanimated';

import { AllAnimationSettings } from '@/types/settings';

export const updateComponentAnimationState = (
  key: string,
  animationProgress: SharedValue<number>,
  animationSettings: AllAnimationSettings,
  removed: boolean,
  onRemove: (k: string) => void
): void => {
  // ANimate vertex on mount
  if (!removed) {
    // Animate vertex on mount
    animationProgress.value = withTiming(1, animationSettings, finished => {
      if (finished && animationSettings.onComplete) {
        runOnJS(animationSettings.onComplete)();
      }
    });
  }
  // Animate vertex removal
  else {
    animationProgress.value = withTiming(0, animationSettings, finished => {
      if (finished) {
        runOnJS(onRemove)(key);
        if (animationSettings.onComplete) {
          runOnJS(animationSettings.onComplete)();
        }
      }
    });
  }
};
