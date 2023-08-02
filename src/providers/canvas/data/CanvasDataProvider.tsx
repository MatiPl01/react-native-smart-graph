import React, { PropsWithChildren, useEffect, useMemo } from 'react';

import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';

import { CanvasDataContext, CanvasDataContextType } from './context';
import { clearContextValue, createContextValue } from './utils';

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
  const contextValue = useMemo<CanvasDataContextType>(
    () => createContextValue(userSettings),
    []
  );

  useEffect(() => {
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
