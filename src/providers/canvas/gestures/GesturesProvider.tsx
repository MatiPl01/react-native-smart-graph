import { createContext, PropsWithChildren, useContext } from 'react';
import { ComposedGesture, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { useAutoSizingContext } from '@/providers/canvas/auto';
import { useCanvasDataContext } from '@/providers/canvas/data';
import { useTransformContext } from '@/providers/canvas/transform';
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
  const { disableAutoSizing, enableAutoSizingAfterTimeout } =
    useAutoSizingContext();

  // OTHER VALUES
  const pinchStartScale = useSharedValue(1);

  const panGestureHandler = Gesture.Pan()
    .onStart(() => {
      runOnJS(disableAutoSizing)();
    })
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
      runOnJS(enableAutoSizingAfterTimeout)();
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
      runOnJS(enableAutoSizingAfterTimeout)();
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
      runOnJS(enableAutoSizingAfterTimeout)();
    });

  const contextValue: GesturesContextType = {
    gestureHandler: Gesture.Race(
      Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
      doubleTapGestureHandler
    )
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <GesturesContext.Provider value={contextValue as any}>
      {children}
    </GesturesContext.Provider>
  );
}
