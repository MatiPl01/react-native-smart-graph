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
  const { objectFit } = useCanvasDataContext();
  // Transform context values
  const { resetContainerPosition } = useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();
  // Focus context values
  const { focus } = useFocusContext();

  // Other values
  const isInitialRender = useSharedValue(true);

  useAnimatedReaction(
    () => objectFit.value,
    () => {
      if (isInitialRender.value) {
        isInitialRender.value = false;
        return;
      }
      // Don't reset the container position if there is a focused object
      if (focus.key.value !== null) return;
      // Disable auto sizing
      autoSizingContext.disableAutoSizing();
      // Reset the container position
      resetContainerPosition({
        animationSettings: {
          ...DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS,
          onComplete: () => {
            // Re-enable auto sizing after the container position has been reset
            autoSizingContext.enableAutoSizing();
          }
        }
      });
    }
  );

  return <>{children}</>;
}
