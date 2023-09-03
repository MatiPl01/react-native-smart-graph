import { PropsWithChildren } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS } from '@/constants/animations';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withGraphSettings } from '@/providers/graph/data';

type SettingsChangeResponderProviderProps = PropsWithChildren<{
  focusProgress?: SharedValue<number>;
}>;

function SettingsChangeResponderProvider({
  children,
  focusProgress
}: SettingsChangeResponderProviderProps) {
  // CONTEXT VALUES
  const {
    autoSizingContext,
    dataContext: { initialScaleProvided, isRendered, objectFit },
    focusContext: { focus },
    transformContext: { resetContainerPosition }
  } = useCanvasContexts();

  // Other values
  const isFirstAutoSizingReactionCall = useSharedValue(true);
  const prevObjectFit = useSharedValue<null | string>(null);

  // A workaround to make sure that the auto sizing is enabled after the
  // object-fit change animation has completed
  const delayedEnableAutoSizing = () => {
    setTimeout(() => {
      autoSizingContext.enableAutoSizing();
    }, 0);
  };

  // Disable auto sizing on every objectFit change
  useAnimatedReaction(
    () => ({
      objFit: objectFit.value,
      rendered: isRendered.value
    }),
    ({ objFit, rendered }) => {
      if (!rendered) return;
      if (!isFirstAutoSizingReactionCall.value) {
        autoSizingContext.disableAutoSizing();
        return;
      }
      isFirstAutoSizingReactionCall.value = false;
      prevObjectFit.value = objFit;
      // For the first reaction call only
      if (objFit !== 'none' && !focusProgress?.value) {
        if (initialScaleProvided.value) {
          autoSizingContext.enableAutoSizingAfterTimeout();
        } else {
          autoSizingContext.enableAutoSizing();
        }
      }
    }
  );

  // On every objectFit change, after auto-sizing has been disabled,
  // reset the container position
  const autoSizingEnabled = autoSizingContext.autoSizingEnabled;
  useAnimatedReaction(
    () => objectFit.value !== prevObjectFit.value && !autoSizingEnabled.value,
    shouldReset => {
      if (!shouldReset) return;
      prevObjectFit.value = objectFit.value;
      // Don't reset the container position if there is a focused object
      if (focus.key.value !== null) return;
      // Reset the container position
      resetContainerPosition({
        animationSettings: {
          ...DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS,
          onComplete: completed => {
            // Re-enable auto sizing after the container position has been reset
            if (completed) {
              runOnJS(delayedEnableAutoSizing)();
            }
          }
        }
      });
    }
  );

  return <>{children}</>;
}

export default withGraphSettings(
  SettingsChangeResponderProvider,
  ({ focusSettings }) => ({
    focusProgress: focusSettings?.progress
  })
);
