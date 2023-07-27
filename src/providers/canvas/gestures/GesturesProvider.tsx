import { Vector } from '@shopify/react-native-skia';
import { createContext, useContext, useMemo } from 'react';
import { ComposedGesture, Gesture } from 'react-native-gesture-handler';
import {
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

export type GesturesContextType = {
  gestureHandler: ComposedGesture;
};

const GesturesContext = createContext(null as unknown as object);

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

export default function GesturesProvider({
  children
}: {
  children?: React.ReactNode;
}) {
  // OTHER CONTEXTS VALUES
  // Canvas data context values
  const {
    currentScale,
    currentTranslation: { x: translateX, y: translateY },
    isGestureActive,
    maxScale,
    minScale,
    scales
  } = useCanvasDataContext();
  // Transform context values
  const { getTranslateClamp, scaleContentTo } = useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();
  // Focus context values
  const { blur, endFocus, focusStatus, gesturesDisabled } = useFocusContext();

  // OTHER VALUES
  // Gestures helper values
  const isInitialRender = useSharedValue(true);
  // Pan
  const panStartScale = useSharedValue(1);
  // Pinch
  const pinchStartScale = useSharedValue(1);
  const pinchDecayScale = useSharedValue(1);
  const pinchEndPosition = useSharedValue({ x: 0, y: 0 });

  const handleGestureStart = (origin?: Maybe<Vector>) => {
    'worklet';
    isGestureActive.value = true;
    autoSizingContext.disableAutoSizing();
    if (focusStatus.value !== FocusStatus.BLUR) {
      endFocus(origin && { origin });
    }
  };

  const handleGestureEnd = () => {
    'worklet';
    isGestureActive.value = false;
    autoSizingContext.enableAutoSizingAfterTimeout();
  };

  const panGestureHandler = Gesture.Pan()
    .onStart(({ numberOfPointers, x, y }) => {
      if (gesturesDisabled.value) return;
      blur.translationX.value = 0;
      blur.translationY.value = 0;
      panStartScale.value = currentScale.value;
      // If there are multiple pointers, we don't want to end
      // focus with a blur transition to the origin
      handleGestureStart(numberOfPointers > 1 ? null : { x, y });
    })
    .onChange(e => {
      if (gesturesDisabled.value) return;
      // The focus provider will handle canvas translation on blur transition
      if (focusStatus.value === FocusStatus.BLUR_TRANSITION) {
        blur.translationX.value += e.changeX;
        blur.translationY.value += e.changeY;
      }
      // Otherwise, translate the canvas normally
      else {
        translateX.value += e.changeX;
        translateY.value += e.changeY;
      }
    })
    .onEnd(({ velocityX, velocityY }) => {
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
      handleGestureEnd();
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      if (gesturesDisabled.value) return;
      pinchStartScale.value = currentScale.value;
      handleGestureStart(null);
    })
    .onChange(({ focalX, focalY, scale }) => {
      if (gesturesDisabled.value) return;
      scaleContentTo(
        pinchStartScale.value * scale,
        { x: focalX, y: focalY },
        undefined,
        { withClamping: false }
      );
    })
    .onEnd(({ focalX, focalY, velocity }) => {
      if (gesturesDisabled.value) return;
      pinchDecayScale.value = currentScale.value;
      pinchEndPosition.value = { x: focalX, y: focalY };
      pinchDecayScale.value = withDecay({
        clamp: [minScale.value, maxScale.value],
        rubberBandEffect: true,
        velocity
      });
      handleGestureEnd();
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .maxDistance(50)
    .onStart(() => {
      if (gesturesDisabled.value) return;
      handleGestureStart();
    })
    .onEnd(({ x, y }) => {
      if (gesturesDisabled.value) return;
      const origin = { x, y };

      if (currentScale.value === maxScale.value) {
        const defaultScale =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          scales.value.length >= 3 ? scales.value[1]! : scales.value[0]!;
        scaleContentTo(
          defaultScale,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      } else {
        // Find the first scale that is bigger than current scale
        const newScale = scales.value.find(scale => scale > currentScale.value);
        scaleContentTo(
          newScale ?? maxScale.value,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      }
      handleGestureEnd();
    });

  useAnimatedReaction(
    () => ({
      decayScale: pinchDecayScale.value,
      endPosition: pinchEndPosition.value
    }),
    ({ decayScale, endPosition }) => {
      if (isInitialRender.value) {
        isInitialRender.value = false;
        return;
      }
      scaleContentTo(Math.max(decayScale, 0), endPosition);
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
    <GesturesContext.Provider value={contextValue}>
      {children}
    </GesturesContext.Provider>
  );
}
