import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';

import { GraphViewData } from '@/types/components';
import { ObjectFit, Spacing } from '@/types/layout';
import { useNullableContext } from '@/utils/contexts';

import {
  clearContextValue,
  createContextValue,
  updateContextValue
} from './utils';

const GraphViewDataContext = createContext<GraphViewData | null>(null);
GraphViewDataContext.displayName = 'GraphViewDataContext';

export const useViewDataContext = () =>
  useNullableContext(GraphViewDataContext);

export type GraphViewDataProviderProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: Array<number>;
}>;

export default function GraphViewDataProvider({
  children,
  ...userSettings
}: GraphViewDataProviderProps) {
  const contextValue = useMemo(() => createContextValue(userSettings), []);

  useEffect(() => {
    updateContextValue(userSettings, contextValue);
  }, [userSettings]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clearContextValue(contextValue);
    };
  }, []);

  return (
    <GraphViewDataContext.Provider value={contextValue}>
      {children}
    </GraphViewDataContext.Provider>
  );
}
