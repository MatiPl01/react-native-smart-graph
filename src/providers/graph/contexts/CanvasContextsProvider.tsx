import { createContext, useContext } from 'react';

import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import {
  AutoSizingContextType,
  CanvasDataContextType,
  FocusContextType,
  GesturesContextType,
  TransformContextType
} from '@/providers/canvas';

export type CanvasContexts = {
  autoSizingContext: AutoSizingContextType;
  dataContext: CanvasDataContextType;
  focusContext: FocusContextType;
  gesturesContext: GesturesContextType;
  overlayContext: AccessibleOverlayContextType;
  transformContext: TransformContextType;
};

export const CanvasContextsContext = createContext(null as unknown as object);

export const useCanvasContexts = () => {
  const contextValue = useContext(CanvasContextsContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasContexts must be used within a CanvasContextsContext.Provider'
    );
  }

  return contextValue as CanvasContexts;
};
