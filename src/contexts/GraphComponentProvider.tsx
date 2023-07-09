import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import DirectedGraphComponent, {
  DirectedGraphComponentProps
} from '@/components/graphs/DirectedGraphComponent';
import UndirectedGraphComponent, {
  UndirectedGraphComponentProps
} from '@/components/graphs/UndirectedGraphComponent';
import { deepMemoComparator } from '@/utils/equality';

type GraphComponentContextType = {
  component: React.ReactNode | null;
};

const GraphComponentContext = createContext(null);

export const useGraphComponentContext = () => {
  const contextValue = useContext(GraphComponentContext);

  if (!contextValue) {
    throw new Error(
      'useGraphComponentContext must be used within a GraphComponentProvider'
    );
  }

  return contextValue as GraphComponentContextType;
};

export type GraphComponentType<V, E> =
  | React.ReactElement<
      DirectedGraphComponentProps<V, E>,
      typeof DirectedGraphComponent
    >
  | React.ReactElement<
      UndirectedGraphComponentProps<V, E>,
      typeof UndirectedGraphComponent
    >;

type GraphComponentProviderProps<
  V,
  E,
  C extends GraphComponentType<V, E>
> = PropsWithChildren<{
  component: C;
}>;

export default function GraphComponentProvider<
  V,
  E,
  C extends GraphComponentType<V, E>
>({ children, component }: GraphComponentProviderProps<V, E, C>) {
  const [renderedComponent, setRenderedComponent] = useState<C | null>(null);

  const contextValue = useMemo<GraphComponentContextType>(
    () => ({
      component: renderedComponent
    }),
    [renderedComponent]
  );

  useEffect(() => {
    if (
      !renderedComponent ||
      // Use the re-rendered graph component if the graph data has changed
      !deepMemoComparator({
        include: ['graph', 'renderers', 'settings'],
        shallow: ['graph']
      })(renderedComponent.props, component.props)
    ) {
      setRenderedComponent(component);
    }
  }, [component]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <GraphComponentContext.Provider value={contextValue as any}>
      {children}
    </GraphComponentContext.Provider>
  );
}
