import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { deepMemoComparator } from '@/utils/equality';

type GraphViewChildrenContextType<
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
> = {
  canvas: React.ReactElement<P> | null;
  overlay: React.ReactNode;
};

const GraphViewChildrenContext = createContext(null);

export const useGraphViewChildrenContext = <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>() => {
  const contextValue = useContext(GraphViewChildrenContext);

  if (!contextValue) {
    throw new Error(
      'useGraphViewChildrenContext must be used within a GraphViewChildrenProvider'
    );
  }

  return contextValue as GraphViewChildrenContextType<V, E, P>;
};

type GraphViewChildrenProviderProps = PropsWithChildren<{
  graphViewChildren: React.ReactNode;
}>;

export default function GraphViewChildrenProvider<
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>({ children, graphViewChildren }: GraphViewChildrenProviderProps) {
  const [canvas, setCanvas] = useState<React.ReactElement<P> | null>(null);

  useEffect(() => {
    const canvasChildren = graphViewChildren as React.ReactElement<P>; // TODO - change in a separate PR (#201)
    if (
      !canvas ||
      !deepMemoComparator({
        include: ['graph', 'settings', 'renderers'],
        shallow: ['graph']
      })(canvas.props, canvasChildren.props)
    ) {
      setCanvas(canvasChildren);
    }
  }, [graphViewChildren]);

  const contextValue = useMemo<GraphViewChildrenContextType<V, E, P>>(
    () => ({
      canvas,
      overlay: null // TODO - add this in a separate PR (#201)
    }),
    [canvas]
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <GraphViewChildrenContext.Provider value={contextValue as any}>
      {children}
    </GraphViewChildrenContext.Provider>
  );
}
