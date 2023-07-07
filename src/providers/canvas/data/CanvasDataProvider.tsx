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
  AnimatedVectorCoordinates
} from '@/types/layout';

type CanvasDataContextType = {
  autoSizingEnabled: SharedValue<boolean>;
  boundingRect: AnimatedBoundingRect;
  canvasDimensions: AnimatedDimensions;
  currentScale: SharedValue<number>;
  currentTranslation: AnimatedVectorCoordinates;
  initialScale: number;
  scales: number[];
};

const CanvasDataContext = createContext(null);

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
  initialScale: number;
  scales: number[];
}>;

export default function CanvasDataProvider({
  children,
  initialScale,
  scales
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
  const currentScale = useSharedValue(0);
  // TRANSLATION
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // AUTO SIZING
  const autoSizingEnabled = useSharedValue(true);

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
      initialScale,
      scales
    }),
    [scales]
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <CanvasDataContext.Provider value={contextValue as any}>
      {children}
    </CanvasDataContext.Provider>
  );
}
