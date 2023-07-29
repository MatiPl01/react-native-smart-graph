import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

export const useComponentFocus = (
  result: SharedValue<number>,
  transitionProgress: SharedValue<number>,
  focusedComponentKey: SharedValue<null | string>,
  componentKey?: string
): void => {
  useAnimatedReaction(
    () => ({
      focusedKey: focusedComponentKey.value,
      previousResult: result.value,
      progress: transitionProgress.value
    }),
    ({ focusedKey, previousResult, progress }) => {
      if (focusedKey === componentKey || focusedKey === null) {
        result.value = Math.max(previousResult, progress);
      } else {
        // TODO - fix when progress doesn't go to 1
        result.value = Math.min(previousResult, 1 - progress);
      }
    },
    [componentKey]
  );
};
