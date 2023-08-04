import { PropsWithChildren, useEffect, useState } from 'react';

import { GraphDataContext, GraphDataContextType } from './context';
import { createContextValue, GraphData } from './utils';

type GraphDataProviderProps<V, E> = PropsWithChildren<GraphData<V, E>>;

export default function GraphDataProvider<V, E>({
  children,
  ...userSettings
}: GraphDataProviderProps<V, E>) {
  const [contextValue, setContextValue] = useState<GraphDataContextType<V, E>>(
    createContextValue(userSettings)
  );

  useEffect(() => {
    // TODO add context value update logic
  }, [userSettings]);

  return (
    <GraphDataContext.Provider value={contextValue}>
      {children}
    </GraphDataContext.Provider>
  );
}
