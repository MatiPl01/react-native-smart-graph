import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo
} from 'react';
import { ComposedGesture, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { DEFAULT_GESTURE_ANIMATION_SETTINGS } from '@/constants/animations';
import { useAutoSizingContext } from '@/providers/canvas/auto';
import { useCanvasDataContext } from '@/providers/canvas/data';
import {
  useFocusContext,
  useTransformContext
} from '@/providers/canvas/transform';
import { fixedWithDecay } from '@/utils/reanimated';

type GesturesContextType = {
  gestureHandler: ComposedGesture;
};

const GesturesContext = createContext(null);

export const useGesturesContext = () => {
  const contextValue = useContext(GesturesContext);

  if (!contextValue) {
    throw new Error(
      'useGesturesContext must be used within a GesturesProvider'
    );
  }

  return contextValue as GesturesContextType;
};

type GesturesProviderProps = PropsWithChildren<{
  initialScale: number;
  maxScale: number;
  minScale: number;
  scaleValues: number[];
}>;

export default function GesturesProvider({
  children,
  initialScale,
  maxScale,
  minScale,
  scaleValues
}: GesturesProviderProps) {
  // CONTEXT VALUES
  // Canvas data context values
  const {
    currentScale,
    currentTranslation: { x: translateX, y: translateY }
  } = useCanvasDataContext();
  // Transform context values
  const { getTranslateClamp, scaleContentTo } = useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();
  // Focus context values
  const { endFocus, focusStatus, gesturesDisabled } = useFocusContext();

  // OTHER VALUES
  const pinchStartScale = useSharedValue(1);
  const panStartScale = useSharedValue(1);
  const panTranslateX = useSharedValue(0);
  const panTranslateY = useSharedValue(0);
  const isPanning = useSharedValue(false);

  const handleGestureStart = useCallback(
    (withPosition?: boolean) => {
      if (focusStatus.value) {
        endFocus(
          withPosition
            ? {
                isPanning,
                position: {
                  x: panTranslateX,
                  y: panTranslateY
                }
              }
            : undefined
        );
      } else if (autoSizingContext) {
        autoSizingContext.disableAutoSizing();
      }
    },
    [endFocus, autoSizingContext?.disableAutoSizing]
  );

  const panGestureHandler = Gesture.Pan()
    .onStart(({ x, y }) => {
      if (gesturesDisabled.value) return;
      panStartScale.value = currentScale.value;
      panTranslateX.value = x;
      panTranslateY.value = y;
      runOnJS(handleGestureStart)(true);
      isPanning.value = true;
    })
    .onChange(e => {
      if (gesturesDisabled.value) return;
      // The focus provider will handle canvas translation when focusing
      if (focusStatus.value) {
        panTranslateX.value += e.changeX;
        panTranslateY.value += e.changeY;
      }
      // Otherwise, translate canvas normally
      else {
        translateX.value += e.changeX;
        translateY.value += e.changeY;
      }
    })
    .onEnd(({ velocityX, velocityY }) => {
      if (gesturesDisabled.value) return;
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
      if (autoSizingContext) {
        runOnJS(autoSizingContext.enableAutoSizingAfterTimeout)();
      }
      isPanning.value = false;
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      if (gesturesDisabled.value) return;
      pinchStartScale.value = currentScale.value;
      runOnJS(handleGestureStart)();
    })
    .onChange(e => {
      if (gesturesDisabled.value) return;
      scaleContentTo(pinchStartScale.value * e.scale, {
        x: e.focalX,
        y: e.focalY
      });
    })
    .onEnd(e => {
      if (gesturesDisabled.value) return;
      currentScale.value = fixedWithDecay(e.velocity, currentScale.value, [
        minScale,
        maxScale
      ]);
      if (autoSizingContext) {
        runOnJS(autoSizingContext.enableAutoSizingAfterTimeout)();
      }
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (gesturesDisabled.value) return;
      runOnJS(handleGestureStart)();
    })
    .onEnd(({ x, y }) => {
      if (gesturesDisabled.value) return;
      const origin = { x, y };

      if (currentScale.value === maxScale) {
        scaleContentTo(
          initialScale,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      } else {
        // Find first scale that is bigger than current scale
        const newScale = scaleValues.find(scale => scale > currentScale.value);
        scaleContentTo(
          newScale ?? maxScale,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      }
      if (autoSizingContext) {
        runOnJS(autoSizingContext.enableAutoSizingAfterTimeout)();
      }
    });

  const contextValue = useMemo<GesturesContextType>(
    () => ({
      gestureHandler: Gesture.Race(
        Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
        doubleTapGestureHandler
      )
    }),
    []
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <GesturesContext.Provider value={contextValue as any}>
      {children}
    </GesturesContext.Provider>
  );
}
