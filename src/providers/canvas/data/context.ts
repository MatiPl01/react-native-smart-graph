import { createContext, useContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

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

export const CanvasDataContext = createContext(null as unknown as object);

export const useCanvasDataContext = () => {
  const contextValue = useContext(CanvasDataContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasDataContext must be used within a CanvasDataProvider'
    );
  }

  return contextValue as CanvasDataContextType;
};
