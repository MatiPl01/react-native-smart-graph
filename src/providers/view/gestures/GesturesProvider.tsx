import { Vector } from '@shopify/react-native-skia';
import { createContext, useMemo } from 'react';
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
  useFocusContext,
  useTransformContext
} from '@/providers/view';
import { useViewDataContext } from '@/providers/view/data';
import { Maybe } from '@/types/utils';
import { useNullableContext } from '@/utils/contexts';
import { averageVector } from '@/utils/vectors';

export type GesturesContextType = {
  gestureHandler: ComposedGesture;
};

const GesturesContext = createContext<GesturesContextType | null>(null);
GesturesContext.displayName = 'GesturesContext';

export const useGesturesContext = () => useNullableContext(GesturesContext);

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
  // CONTEXTS
  // Canvas contexts
  const {
    currentScale,
    currentTranslation: { x: translateX, y: translateY },
    gesturesDisabled,
    isGestureActive,
    maxScale,
    minScale,
    scales
  } = useViewDataContext();
  const { getTranslateClamp, scaleContentTo } = useTransformContext();
  const autoSizingContext = useAutoSizingContext();
  const { blur, endFocus, focusStatus } = useFocusContext();

  // OTHER VALUES
  // Gestures helper values
  const isInitialRender = useSharedValue(true);
  // Pan
  const isPanActive = useSharedValue(false);
  const panStartScale = useSharedValue(1);
  const prevPanPositions = useSharedValue<Record<string, Vector>>({});
  // Pinch
  const isPinchActive = useSharedValue(false);
  const shouldHandlePinchEnd = useSharedValue(false);
  const pinchEndOrigin = useSharedValue<Maybe<Vector>>(null);
  const pinchStartScale = useSharedValue(1);
  const pinchDecayScale = useSharedValue(1);
  const pinchEndVelocity = useSharedValue(0);

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
    // Don't do anything if there is still an active gesture
    if (isPanActive.value || isPinchActive.value) {
      return;
    }
    isGestureActive.value = false;
    autoSizingContext.enableAutoSizingAfterTimeout();
  };

  const handlePanEnd = (velocityX: number, velocityY: number) => {
    'worklet';
    const { x: clampX, y: clampY } = getTranslateClamp(
      Math.min(Math.max(minScale.value, currentScale.value), maxScale.value)
    );
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
  };

  const handlePinchEnd = () => {
    'worklet';
    pinchDecayScale.value = withDecay({
      ...TRANSLATION_DECAY_CONFIG,
      clamp: [minScale.value, maxScale.value],
      velocity: pinchEndVelocity.value
    });
    shouldHandlePinchEnd.value = false;
    handleGestureEnd();
  };

  const applyPanTranslation = ({ x, y }: Vector) => {
    'worklet';
    // The focus provider will handle canvas translation on blur transition
    if (focusStatus.value === FocusStatus.BLUR_TRANSITION) {
      blur.translationX.value += x;
      blur.translationY.value += y;
    }
    // Otherwise, translate the canvas normally
    else {
      translateX.value += x;
      translateY.value += y;
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onStart(({ numberOfPointers, x, y }) => {
      if (gesturesDisabled.value) return;
      isPanActive.value = true;
      blur.translationX.value = 0;
      blur.translationY.value = 0;
      panStartScale.value = currentScale.value;
      // If there are multiple pointers, we don't want to end
      // focus with a blur transition to the origin
      handleGestureStart(numberOfPointers > 1 ? null : { x, y });
    })
    // Use this only for single-touch panning
    .onChange(({ changeX, changeY, numberOfPointers }) => {
      if (gesturesDisabled.value || numberOfPointers > 1) return;
      // Reset previous positions if there is only one touch
      prevPanPositions.value = {};
      // Update previous position
      applyPanTranslation({ x: changeX, y: changeY });
    })
    // Use this only for multi-touch panning
    .onTouchesMove(({ allTouches }) => {
      if (gesturesDisabled.value || allTouches.length < 2) return;
      // Activate pinch gesture handler
      // Calculate the average change in position
      const avgChange = averageVector(
        allTouches.map(({ absoluteX, absoluteY, id }) => {
          const prevPosition = prevPanPositions.value[id];
          if (!prevPosition) return { x: 0, y: 0 };
          return {
            x: absoluteX - prevPosition.x,
            y: absoluteY - prevPosition.y
          };
        })
      );
      // Apply the translation to the canvas
      applyPanTranslation(avgChange);
      // Update previous touches
      prevPanPositions.value = Object.fromEntries(
        allTouches.map(({ absoluteX, absoluteY, id }) => [
          id,
          { x: absoluteX, y: absoluteY }
        ])
      );
    })
    .onEnd(({ velocityX, velocityY }) => {
      isPanActive.value = false;
      prevPanPositions.value = {};
      if (gesturesDisabled.value) return;
      if (shouldHandlePinchEnd.value) {
        handlePinchEnd();
        if (!pinchEndOrigin.value) handlePanEnd(velocityX, velocityY);
      } else handlePanEnd(velocityX, velocityY);
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      if (gesturesDisabled.value) return;
      isPinchActive.value = true;
      pinchEndOrigin.value = null;
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
      isPinchActive.value = false;
      if (gesturesDisabled.value) return;
      pinchDecayScale.value = currentScale.value;
      pinchEndVelocity.value = velocity;
      pinchEndOrigin.value =
        currentScale.value > maxScale.value ? { x: focalX, y: focalY } : null;
      if (!isPanActive.value) handlePinchEnd();
      else shouldHandlePinchEnd.value = true;
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
          DEFAULT_GESTURE_ANIMATION_SETTINGS,
          { withClamping: true }
        );
      } else {
        // Find the first scale that is bigger than current scale
        const newScale = scales.value.find(scale => scale > currentScale.value);
        scaleContentTo(
          newScale ?? maxScale.value,
          origin,
          DEFAULT_GESTURE_ANIMATION_SETTINGS,
          { withClamping: true }
        );
      }
      handleGestureEnd();
    });

  useAnimatedReaction(
    () => pinchDecayScale.value,
    decayScale => {
      if (isInitialRender.value) {
        isInitialRender.value = false;
        return;
      }
      // Stop the decay animation if the user starts a new gesture
      if (isPanActive.value || isPinchActive.value) return;
      scaleContentTo(
        Math.max(decayScale, 0),
        pinchEndOrigin.value ?? undefined,
        undefined,
        {
          withClamping: true
        }
      );
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
