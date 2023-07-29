import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/canvas';

export const useComponentFocus = (
  result: SharedValue<number>,
  focusContext: FocusContextType,
  componentKey?: string
): void => {
  useAnimatedReaction(
    () => ({
      focusedKey: focusContext.focus.key.value,
      progress: focusContext.transitionProgress.value
    }),
    ({ focusedKey, progress }) => {
      const previousResult = result.value;

      // If the current component is focused or there is no focus at all,
      // we want to remove blur from the current component
      if (focusedKey === componentKey || focusedKey === null) {
        result.value = Math.max(previousResult, progress);
      }
      // If progress is increasing, we want to blur the current component
      else if (!(previousResult === 1 && progress === 1)) {
        result.value = Math.min(previousResult, 1 - progress);
      }
    },
    [componentKey]
  );
};
