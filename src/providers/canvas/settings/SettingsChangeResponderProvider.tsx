import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS } from '@/constants/animations';
import { useAutoSizingContext } from '@/providers/canvas/auto';
import { useCanvasDataContext } from '@/providers/canvas/data';
import {
  useFocusContext,
  useTransformContext
} from '@/providers/canvas/transform';

export default function SettingsChangeResponderProvider({
  children
}: {
  children?: React.ReactNode;
}) {
  // CONTEXT VALUES
  // Canvas data context values
  const { initialScaleProvided, isRendered, objectFit } =
    useCanvasDataContext();
  // Transform context values
  const { resetContainerPosition } = useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();
  // Focus context values
  const { focusKey } = useFocusContext();

  // Other values
  const isFirstAutoSizingReactionCall = useSharedValue(true);
  const isFirstResetReactionCall = useSharedValue(true);

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
      if (objFit !== 'none') {
        isFirstAutoSizingReactionCall.value = false;
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
  useAnimatedReaction(
    () => objectFit.value && !autoSizingContext.autoSizingEnabled.value,
    () => {
      if (isFirstResetReactionCall.value) {
        isFirstResetReactionCall.value = false;
        return;
      }
      // Don't reset the container position if there is a focused object
      if (focusKey.value !== null) return;
      // Reset the container position
      resetContainerPosition({
        animationSettings: {
          ...DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS,
          onComplete: completed => {
            // Re-enable auto sizing after the container position has been reset
            if (completed) autoSizingContext.enableAutoSizing();
          }
        }
      });
    }
  );

  return <>{children}</>;
}
