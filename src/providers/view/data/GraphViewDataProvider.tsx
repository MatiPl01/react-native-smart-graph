import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo
} from 'react';

import { GraphViewData } from '@/types/components';
import { ObjectFit, Spacing } from '@/types/layout';

import {
  clearContextValue,
  createContextValue,
  updateContextValue
} from './utils';

const GraphViewDataContext = createContext(null as unknown as object);

export const useViewDataContext = () => {
  const contextValue = useContext(GraphViewDataContext);

  if (!contextValue) {
    throw new Error(
      'useViewDataContext must be used within a GraphViewDataProvider'
    );
  }

  return contextValue as GraphViewData;
};

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

    return () => {
      clearContextValue(contextValue);
    };
  }, [userSettings]);

  return (
    <GraphViewDataContext.Provider value={contextValue}>
      {children}
    </GraphViewDataContext.Provider>
  );
}
