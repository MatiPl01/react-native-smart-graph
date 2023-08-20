import { runOnJS, SharedValue, withTiming } from 'react-native-reanimated';

import { AllAnimationSettings } from '@/types/settings';

export const updateComponentAnimationState = (
  key: string,
  animationProgress: SharedValue<number>,
  animationSettings: AllAnimationSettings | null,
  removed: boolean,
  onRemove: (k: string) => void
): void => {
  // Animate vertex if animationSettings is not null
  if (animationSettings) {
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
    // Otherwise, if animationSettings is null, remove vertex immediately
  } else {
    // eslint-disable-next-line no-lonely-if
    if (!removed) {
      animationProgress.value = 1;
    } else {
      animationProgress.value = 0;
      runOnJS(onRemove)(key);
    }
  }
};
