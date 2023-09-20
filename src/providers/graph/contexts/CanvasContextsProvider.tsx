import { createContext, PropsWithChildren, useContext } from 'react';

import { AccessibleOverlayContextType } from '@/contexts/overlay/OverlayProvider';
import {
  AutoSizingContextType,
  FocusContextType,
  GesturesContextType,
  TransformContextType
} from '@/providers/view';
import { GraphViewData } from '@/types/components';

export type CanvasContexts = {
  autoSizingContext: AutoSizingContextType;
  dataContext: GraphViewData;
  focusContext: FocusContextType;
  gesturesContext: GesturesContextType;
  overlayContext: AccessibleOverlayContextType;
  transformContext: TransformContextType;
};

const CanvasContextsContext = createContext(null as unknown as object);

export const useCanvasContexts = () => {
  const contextValue = useContext(CanvasContextsContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasContexts must be used within a CanvasContextsContext.Provider'
    );
  }

  return contextValue as CanvasContexts;
};

type CanvasContextsProviderProps = PropsWithChildren<{
  canvasContexts: CanvasContexts;
}>;

export default function CanvasContextsProvider({
  canvasContexts,
  children
}: CanvasContextsProviderProps) {
  return (
    <CanvasContextsContext.Provider value={canvasContexts}>
      {children}
    </CanvasContextsContext.Provider>
  );
}
