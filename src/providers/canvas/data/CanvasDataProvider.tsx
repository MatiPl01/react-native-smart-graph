import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo
} from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  AnimatedVectorCoordinates,
  BoundingRect
} from '@/types/layout';
import { ObjectFit } from '@/types/views';

export type CanvasDataContextType = {
  autoSizingEnabled: SharedValue<boolean>;
  autoSizingTimeout: SharedValue<number>;
  boundingRect: AnimatedBoundingRect;
  canvasDimensions: AnimatedDimensions;
  currentScale: SharedValue<number>;
  currentTranslation: AnimatedVectorCoordinates;
  gesturesDisabled: SharedValue<boolean>;
  initialScale: SharedValue<number>;
  initialScaleProvided: SharedValue<boolean>;
  isGestureActive: SharedValue<boolean>;
  isRendered: SharedValue<boolean>;
  maxScale: SharedValue<number>;
  minScale: SharedValue<number>;
  objectFit: SharedValue<ObjectFit>;
  padding: SharedValue<BoundingRect>;
  scales: SharedValue<number[]>;
};

const CanvasDataContext = createContext(null as unknown as object);

export const useCanvasDataContext = () => {
  const contextValue = useContext(CanvasDataContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasDataContext must be used within a CanvasDataProvider'
    );
  }

  return contextValue as CanvasDataContextType;
};

type CanvasDataProviderProps = PropsWithChildren<{
  autoSizingTimeout: SharedValue<number>;
  initialScale: SharedValue<number>;
  initialScaleProvided: SharedValue<boolean>;
  maxScale: SharedValue<number>;
  minScale: SharedValue<number>;
  objectFit: SharedValue<ObjectFit>;
  padding: SharedValue<BoundingRect>;
  scales: SharedValue<number[]>;
}>;

export default function CanvasDataProvider({
  children,
  ...canvasSettings
}: CanvasDataProviderProps) {
  // BASIC DATA
  const isRendered = useSharedValue(false);
  // CANVAS
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);
  // BOUNDING RECT
  const containerTop = useSharedValue(0);
  const containerLeft = useSharedValue(0);
  const containerRight = useSharedValue(0);
  const containerBottom = useSharedValue(0);
  // SCALE
  const currentScale = useSharedValue(0);
  // TRANSLATION
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // AUTO SIZING
  const autoSizingEnabled = useSharedValue(false);
  // GESTURES
  const gesturesDisabled = useSharedValue(false);
  const isGestureActive = useSharedValue(false);

  const contextValue: CanvasDataContextType = useMemo(
    () => ({
      autoSizingEnabled,
      boundingRect: {
        bottom: containerBottom,
        left: containerLeft,
        right: containerRight,
        top: containerTop
      },
      canvasDimensions: {
        height: canvasHeight,
        width: canvasWidth
      },
      currentScale,
      currentTranslation: {
        x: translateX,
        y: translateY
      },
      gesturesDisabled,
      isGestureActive,
      isRendered,
      ...canvasSettings
    }),
    []
  );

  return (
    <CanvasDataContext.Provider value={contextValue}>
      {children}
    </CanvasDataContext.Provider>
  );
}
