import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { useAutoSizingContext } from '@/providers/canvas/auto';
import { useCanvasDataContext } from '@/providers/canvas/data';
import { FocusData, FocusSetter } from '@/types/focus';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { calcScaleOnProgress, calcTranslationOnProgress } from '@/utils/views';

import { useTransformContext } from './TransformProvider';

type FocusContextType = {
  setFocus: FocusSetter;
};

const FocusContext = createContext(null);

export const useFocusContext = () => {
  const contextValue = useContext(FocusContext);

  if (!contextValue) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }

  return contextValue as FocusContextType;
};

type FocusProviderProps = {
  children?: React.ReactNode;
};

export default function FocusProvider({ children }: FocusProviderProps) {
  // CONTEXT VALUES
  // Canvas data context values
  const { canvasDimensions, currentScale, currentTranslation } =
    useCanvasDataContext();
  // Canvas transform context values
  const { resetContainerPosition, scaleContentTo, translateContentTo } =
    useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();

  // OTHER VALUES
  // Focused point data
  const [focusData, setFocusData] = useState<FocusData | null>(null);
  // Helper values for focus animation
  const focusStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const focusStartScale = useSharedValue<number>(0);
  const focusTransitionProgress = useSharedValue(0);
  const focusEnabled = useSharedValue(false);

  const setFocus = useCallback(
    (
      data: FocusData | null,
      animationSettings: AnimationSettingsWithDefaults | null
    ) => {
      if (data) {
        startFocusing(data, animationSettings);
      } else {
        stopFocusing(animationSettings);
      }
    },
    []
  );

  const startFocusing = (
    data: FocusData,
    animationSettings: AnimationSettingsWithDefaults | null
  ) => {
    if (autoSizingContext) {
      autoSizingContext.disableAutoSizing();
    }
    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;
      // The following 2 lines are needed when focus changes to another point
      // (we have to reset the progress to 0 and prevent animating the
      // old focus point's position and scale)
      focusEnabled.value = false;
      focusTransitionProgress.value = 0;
      // Update the progress value to 1 to animate the new focus point's
      // position and scale
      focusTransitionProgress.value = withTiming(1, timingConfig, onComplete);
    }
    focusStartTranslation.value = {
      x: currentTranslation.x.value,
      y: currentTranslation.y.value
    };
    focusStartScale.value = currentScale.value;
    focusEnabled.value = true;
    setFocusData(data);
  };

  const stopFocusing = (
    animationSettings: AnimationSettingsWithDefaults | null
  ) => {
    setFocusData(null);
    focusEnabled.value = false;
    // Re-enable auto sizing if it was disabled
    if (autoSizingContext) {
      autoSizingContext.enableAutoSizing(animationSettings);
    }
    // If auto sizing is not used, reset the content position and scale
    // to default values
    else {
      resetContainerPosition(
        animationSettings
          ? {
              animationSettings
            }
          : undefined
      );
    }
  };

  useAnimatedReaction(
    () =>
      focusData && focusEnabled.value
        ? {
            finalScale: focusData.scale.value,
            finalTranslation: {
              x:
                canvasDimensions.width.value / 2 -
                focusData.centerPosition.x.value * focusData.scale.value,
              y:
                canvasDimensions.height.value / 2 -
                focusData.centerPosition.y.value * focusData.scale.value
            },
            startScale: focusStartScale.value,
            startTranslation: focusStartTranslation.value,
            transitionProgress: focusTransitionProgress.value
          }
        : null,
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const {
        finalScale,
        finalTranslation,
        startScale,
        startTranslation,
        transitionProgress
      } = data;
      // Scale the content to the focus scale
      scaleContentTo(
        calcScaleOnProgress(transitionProgress, startScale, finalScale)
      );
      // Translate the content to the focus position
      translateContentTo(
        calcTranslationOnProgress(
          transitionProgress,
          startTranslation,
          finalTranslation
        )
      );
    }
  );

  const contextValue = useMemo<FocusContextType>(() => ({ setFocus }), []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <FocusContext.Provider value={contextValue as any}>
      {children}
    </FocusContext.Provider>
  );
}
