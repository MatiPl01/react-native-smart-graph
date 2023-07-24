import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

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
  const { focus } = useFocusContext();

  // Other values
  const isFirstAutoSizingReactionCall = useSharedValue(true);
  const isFirstResetReactionCall = useSharedValue(true);
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
    () =>
      objectFit.value !== prevObjectFit.value &&
      !autoSizingContext.autoSizingEnabled.value,
    shouldReset => {
      prevObjectFit.value = objectFit.value;
      if (!shouldReset) return;
      if (isFirstResetReactionCall.value) {
        isFirstResetReactionCall.value = false;
        return;
      }
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
