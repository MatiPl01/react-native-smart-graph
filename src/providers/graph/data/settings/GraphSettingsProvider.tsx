import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import { withMemoContext } from '@/utils/contexts';

import {
  clearContextValue,
  createContextValue,
  GraphData,
  updateContextValue
} from './utils';

export const GraphSettingsContext = createContext(null as unknown as object);

export const withGraphSettings = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphSettingsContextType<V, E>) => R
) =>
  withMemoContext(
    Component,
    GraphSettingsContext as unknown as Context<GraphSettingsContextType<V, E>>,
    selector
  );

type GraphSettingsProviderProps<V, E> = PropsWithChildren<GraphData<V, E>>;

export default function GraphSettingsProvider<V, E>({
  children,
  ...userSettings
}: GraphSettingsProviderProps<V, E>) {
  const [contextValue, setContextValue] = useState(
    createContextValue(userSettings)
  );

  useEffect(() => {
    setContextValue(value => updateContextValue(userSettings, value));

    return () => {
      clearContextValue(contextValue);
    };
  }, [userSettings]);

  return (
    <GraphSettingsContext.Provider value={contextValue}>
      {children}
    </GraphSettingsContext.Provider>
  );
}
