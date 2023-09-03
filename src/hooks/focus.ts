import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';
import { animateToValue } from '@/utils/animations';

export const useComponentFocus = (
  result: SharedValue<number>,
  focusContext: FocusContextType,
  componentKey?: string
): void => {
  const focusKey = focusContext.focus.key;
  const focusProgress = focusContext.transitionProgress;

  // Helper value to check if the focus target changed
  const previousReactionFocusKey = useSharedValue<null | string>(null);
  const shouldConverge = useSharedValue(false);

  useAnimatedReaction(
    () => ({
      currentKey: focusKey.value,
      currentResult: result.value,
      progress: focusProgress.value
    }),
    ({ currentKey, currentResult, progress }) => {
      const previousKey = focusContext.previousKey.value;
      let newValue = currentResult;

      // If no focus target, no component is blurred
      if (currentKey === null && previousKey === null) {
        newValue = 1;
      }
      // Transition from blur to focus
      else if (previousKey === null && currentKey !== null) {
        if (componentKey === currentKey) {
          newValue = 1; // Focus target
        } else {
          newValue = 1 - progress; // Others
        }
      }
      // Transition from focus to blur
      else if (previousKey !== null && currentKey === null) {
        if (componentKey === previousKey) {
          newValue = 1; // Previous focus target
        } else {
          newValue = progress; // Others
        }
      }
      // Transition from focus to focus (changing focus target)
      else {
        // If the focus target is the same as the previous one
        // eslint-disable-next-line no-lonely-if
        if (componentKey === currentKey && componentKey === previousKey) {
          newValue = 1; // Focus target
        } else if (componentKey === currentKey) {
          newValue = progress; // Focus target
        } else if (componentKey === previousKey) {
          newValue = 1 - progress; // Previous focus target
        } else {
          newValue = 0; // Others
        }
      }

      // Check if the result value should converge to the new value
      // (e.g. when the focus target changes and progress is not 0 or 1)
      if (previousReactionFocusKey.value !== currentKey) {
        previousReactionFocusKey.value = currentKey;
        shouldConverge.value = true;
      }

      if (shouldConverge.value) {
        // Converge to the new value
        result.value = animateToValue(currentResult, newValue, {
          eps: 0.05
        });
        if (result.value === newValue) {
          shouldConverge.value = false;
        }
      } else {
        // Set the new value
        result.value = newValue;
      }
    },
    [componentKey]
  );
};
