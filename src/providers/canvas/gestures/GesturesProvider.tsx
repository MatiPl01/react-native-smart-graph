import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo
} from 'react';
import { ComposedGesture, Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDecay
} from 'react-native-reanimated';

import { DEFAULT_GESTURE_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  FocusStatus,
  useAutoSizingContext,
  useCanvasDataContext,
  useFocusContext,
  useTransformContext
} from '@/providers/canvas';
import { Maybe } from '@/types/utils';

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

const TRANSLATION_DECAY_CONFIG = {
  deceleration: 0.98,
  rubberBandEffect: true,
  rubberBandFactor: 2.75
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
  // Gestures helper values
  // Pan
  const panStartScale = useSharedValue(1);
  // Pinch
  const pinchStartScale = useSharedValue(1);
  const pinchDecayScale = useSharedValue(1);
  const pinchEndPosition = useSharedValue({ x: 0, y: 0 });
  // Values used by the focus provider
  const panTranslateX = useSharedValue(0);
  const panTranslateY = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  const handleGestureStart = useCallback(
    (origin?: Maybe<Vector>) => {
      isGestureActive.value = true;
      if (focusStatus.value !== FocusStatus.BLUR) {
        endFocus(
          origin && {
            isGestureActive,
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
      // Otherwise, translate the canvas normally
      else {
        translateX.value += e.changeX;
        translateY.value += e.changeY;
      }
    })
    .onEnd(({ velocityX, velocityY }) => {
      isGestureActive.value = false;
      if (gesturesDisabled.value) return;
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = withDecay({
        ...TRANSLATION_DECAY_CONFIG,
        clamp: clampX,
        velocity: velocityX
      });
      translateY.value = withDecay({
        ...TRANSLATION_DECAY_CONFIG,
        clamp: clampY,
        velocity: velocityY
      });
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
    .onChange(({ focalX, focalY, scale }) => {
      if (gesturesDisabled.value) return;
      scaleContentTo(
        pinchStartScale.value * scale,
        { x: focalX, y: focalY },
        undefined,
        false
      );
    })
    .onEnd(({ focalX, focalY, velocity }) => {
      isGestureActive.value = false;
      if (gesturesDisabled.value) return;
      pinchDecayScale.value = currentScale.value;
      pinchEndPosition.value = { x: focalX, y: focalY };
      pinchDecayScale.value = withDecay({
        clamp: [minScale, maxScale],
        rubberBandEffect: true,
        velocity
      });
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
        // Find the first scale that is bigger than current scale
        const newScale = scaleValues.find(scale => scale > currentScale.value);
        scaleContentTo(
          newScale ?? maxScale,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      }
    });

  useAnimatedReaction(
    () => ({
      decayScale: pinchDecayScale.value,
      endPosition: pinchEndPosition.value
    }),
    ({ decayScale, endPosition }) => {
      scaleContentTo(decayScale, endPosition);
    }
  );

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
