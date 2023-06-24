import { createContext, PropsWithChildren, useContext } from 'react';
import { ComposedGesture, Gesture } from 'react-native-gesture-handler';
import { runOnJS, SharedValue, useSharedValue } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { fixedWithDecay } from '@/utils/reanimated';
import { getTranslationClamp } from '@/utils/views';

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
  currentScale: SharedValue<number>;
  onEnd?: () => void;
  onStart?: () => void;
  translation: AnimatedVectorCoordinates;
}>;

export default function GesturesProvider({
  children,
  currentScale,
  onEnd,
  onStart,
  translation
}: GesturesProviderProps) {
  const pinchStartScale = useSharedValue(1);

  const panGestureHandler = Gesture.Pan()
    .onStart(() => {
      if (onStart) runOnJS(onStart)();
    })
    .onChange(e => {
      translation.x.value += e.changeX;
      translation.x.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslationClamp(currentScale.value);
      translation.x.value = fixedWithDecay(
        velocityX,
        translation.x.value,
        clampX
      );
      translation.y.value = fixedWithDecay(
        velocityY,
        translation.y.value,
        clampY
      );
      if (onEnd) runOnJS(onEnd)();
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
      runOnJS(disableAutoSizing)();
    })
    .onChange(e => {
      scaleContentTo(pinchStartScale.value * e.scale, {
        x: e.focalX,
        y: e.focalY
      });
    })
    .onEnd(e => {
      currentScale.value = fixedWithDecay(e.velocity, currentScale.value, [
        minScale,
        maxScale
      ]);
      runOnJS(startAutoSizingTimeout)();
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(disableAutoSizing)();
    })
    .onEnd(({ x, y }) => {
      const origin = { x, y };

      if (currentScale.value === maxScale) {
        scaleContentTo(initialScale, origin, true);
      } else {
        // Find first scale that is bigger than current scale
        const newScale = scaleValues.find(scale => scale > currentScale.value);
        scaleContentTo(newScale ?? maxScale, origin, true);
      }
      runOnJS(startAutoSizingTimeout)();
    });

  const canvasGestureHandler = Gesture.Race(
    Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
    doubleTapGestureHandler
  );

  const contextValue: GesturesContextType = {};

  return (
    <GesturesContext.Provider value={contextValue}>
      {children}
    </GesturesContext.Provider>
  );
}
