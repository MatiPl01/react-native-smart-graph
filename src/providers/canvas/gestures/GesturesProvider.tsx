import { Vector } from '@shopify/react-native-skia';
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
import {
  FocusStatus,
  useAutoSizingContext,
  useCanvasDataContext,
  useFocusContext,
  useTransformContext
} from '@/providers/canvas';
import { Maybe } from '@/types/utils';
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

  const handleGestureStart = useCallback(
    (origin?: Maybe<Vector>) => {
      if (focusStatus.value !== FocusStatus.BLUR) {
        endFocus(
          origin && {
            origin,
            translation: {
              x: panTranslateX,
              y: panTranslateY
            }
          }
        );
      } else if (autoSizingContext) {
        autoSizingContext.disableAutoSizing();
      }
    },
    [autoSizingContext?.disableAutoSizing]
  );

  const panGestureHandler = Gesture.Pan()
    .onStart(({ numberOfPointers, x, y }) => {
      if (gesturesDisabled.value) return;
      panTranslateX.value = 0;
      panTranslateY.value = 0;
      panStartScale.value = currentScale.value;
      // If there are multiple pointers, we don't want to end
      // focus with a blur transition to the origin
      runOnJS(handleGestureStart)(numberOfPointers > 1 ? null : { x, y });
    })
    .onChange(e => {
      if (gesturesDisabled.value) return;
      // The focus provider will handle canvas translation on blur transition
      if (focusStatus.value === FocusStatus.BLUR_TRANSITION) {
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
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      if (gesturesDisabled.value) return;
      pinchStartScale.value = currentScale.value;
      runOnJS(handleGestureStart)(null);
    })
    .onChange(e => {
      if (gesturesDisabled.value) return;
      scaleContentTo(
        pinchStartScale.value * e.scale,
        {
          x: e.focalX,
          y: e.focalY
        },
        undefined,
        false
      );
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
    .maxDistance(50)
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
