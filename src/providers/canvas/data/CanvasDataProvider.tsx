import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo
} from 'react';

import { GraphViewData } from '@/types/components/private/view';
import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';

import {
  clearContextValue,
  createContextValue,
  updateContextValue
} from './utils';

const CanvasDataContext = createContext(null as unknown as object);

export const useCanvasDataContext = () => {
  const contextValue = useContext(CanvasDataContext);

  if (!contextValue) {
    throw new Error(
      'useCanvasDataContext must be used within a CanvasDataProvider'
    );
  }

  return contextValue as GraphViewData;
};

export type CanvasDataProviderProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
}>;

export default function CanvasDataProvider({
  children,
  ...userSettings
}: CanvasDataProviderProps) {
  const contextValue = useMemo(() => createContextValue(userSettings), []);

  useEffect(() => {
    updateContextValue(userSettings, contextValue);

    return () => {
      clearContextValue(contextValue);
    };
  }, [userSettings]);

  return (
    <CanvasDataContext.Provider value={contextValue}>
      {children}
    </CanvasDataContext.Provider>
  );
}
