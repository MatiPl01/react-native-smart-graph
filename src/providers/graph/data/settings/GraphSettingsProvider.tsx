import { PropsWithChildren, useEffect, useState } from 'react';

import { GraphSettingsContext } from '@/providers/graph/data/settings/context';

import {
  clearContextValue,
  createContextValue,
  GraphData,
  updateContextValue
} from './utils';

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
