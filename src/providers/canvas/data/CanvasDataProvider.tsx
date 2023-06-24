import React, { createContext, PropsWithChildren, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  AnimatedVectorCoordinates
} from '@/types/layout';

export type CanvasDataContextType = {
  autoSizingEnabled: SharedValue<boolean>;
  boundingRect: AnimatedBoundingRect;
  canvasDimensions: AnimatedDimensions;
  currentScale: SharedValue<number>;
  currentTranslation: AnimatedVectorCoordinates;
};

const CanvasDataContext = createContext(null);

type CanvasDataProviderProps = PropsWithChildren<{
  initialScale: number;
}>;

export const useCanvasDataContext = () => {
  const contextValue = useContext(CanvasDataContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasDataContext must be used within a CanvasDataProvider'
    );
  }

  return contextValue as CanvasDataContextType;
};

export default function CanvasDataProvider({
  children,
  initialScale
}: CanvasDataProviderProps) {
  // CANVAS
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);
  // BOUNDING RECT
  const containerTop = useSharedValue(0);
  const containerLeft = useSharedValue(0);
  const containerRight = useSharedValue(0);
  const containerBottom = useSharedValue(0);
  // SCALE
  const currentScale = useSharedValue(initialScale);
  // TRANSLATION
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // AUTO SIZING
  const autoSizingEnabled = useSharedValue(false);

  const contextValue: CanvasDataContextType = {
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
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <CanvasDataContext.Provider value={contextValue as any}>
      {children}
    </CanvasDataContext.Provider>
  );
}
