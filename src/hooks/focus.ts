import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';

export const useComponentFocus = (
  result: SharedValue<number>,
  focusContext: FocusContextType,
  componentKey?: string
): void => {
  useAnimatedReaction(
    () => ({
      currentKey: focusContext.focus.key.value,
      progress: focusContext.transitionProgress.value
    }),
    ({ currentKey, progress }) => {
      const previousKey = focusContext.previousKey.value;

      // If no focus target, no component is blurred
      if (currentKey === null && previousKey === null) {
        result.value = 1;
      }
      // Transition from blur to focus
      else if (previousKey === null && currentKey !== null) {
        if (componentKey === currentKey) {
          result.value = 1; // Focus target
        } else {
          result.value = 1 - progress; // Others
        }
      }
      // Transition from focus to blur
      else if (previousKey !== null && currentKey === null) {
        if (componentKey === previousKey) {
          result.value = 1; // Previous focus target
        } else {
          result.value = progress; // Others
        }
      }
      // Transition from focus to focus (changing focus target)
      else {
        // If the focus target is the same as the previous one
        // eslint-disable-next-line no-lonely-if
        if (componentKey === currentKey && componentKey === previousKey) {
          result.value = 1; // Focus target
        } else if (componentKey === currentKey) {
          result.value = progress; // Focus target
        } else if (componentKey === previousKey) {
          result.value = 1 - progress; // Previous focus target
        } else {
          result.value = 0; // Others
        }
      }
    },
    [componentKey]
  );
};
