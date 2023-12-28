import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState
} from 'react';

import { GraphSettingsData } from '@/types/components';
import { GraphData } from '@/types/data';
import { withMemoContext } from '@/utils/contexts';

import {
  clearContextValue,
  createContextValue,
  updateContextValue
} from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GraphSettingsContext = createContext<GraphSettingsData<any, any> | null>(
  null
);
GraphSettingsContext.displayName = 'GraphSettingsContext';

export const withGraphSettings = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphSettingsData<V, E>) => R
) => withMemoContext(Component, GraphSettingsContext, selector);

type GraphSettingsProviderProps<V, E> = PropsWithChildren<GraphData<V, E>>;

export default function GraphSettingsProvider<V, E>({
  children,
  ...restProps
}: GraphSettingsProviderProps<V, E>) {
  const userSettings = useMemo(() => restProps, [...Object.values(restProps)]);

  const [contextValue, setContextValue] = useState(() =>
    createContextValue(userSettings)
  );

  useEffect(() => {
    setContextValue(value => updateContextValue(userSettings, value));
  }, [userSettings]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clearContextValue(contextValue);
    };
  }, []);

  return (
    <GraphSettingsContext.Provider value={contextValue}>
      {children}
    </GraphSettingsContext.Provider>
  );
}
