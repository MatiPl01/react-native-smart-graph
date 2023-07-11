/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Children,
  createContext,
  isValidElement,
  PropsWithChildren,
  useContext,
  useEffect,
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
  canvas: Array<React.ReactElement<P>>;
  overlay: Array<React.ReactElement<Record<string, any>>>;
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

const CANVAS_COMPONENTS = [
  'DirectedGraphComponent',
  'UndirectedGraphComponent'
];

const filterChildren = <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  children: React.ReactNode
): GraphViewChildrenContextType<V, E, P> => {
  const canvas: Array<React.ReactElement<P>> = [];
  const overlay: Array<React.ReactElement> = [];

  Children.forEach(children, child => {
    if (isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const childName = (child?.type as any)?.type?.name as string;
      if (CANVAS_COMPONENTS.includes(childName)) {
        canvas.push(child as React.ReactElement<P>);
      } else {
        overlay.push(child);
      }
    }
  });

  return {
    canvas,
    overlay
  };
};

const getUpdatedContextValue = <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  children: React.ReactNode,
  contextValue: GraphViewChildrenContextType<V, E, P>
): GraphViewChildrenContextType<V, E, P> => {
  const filteredChildren = filterChildren<V, E, P>(children);

  let canvasChildren: Array<React.ReactElement<P>> = [];
  let overlayChildren: Array<React.ReactElement<Record<string, any>>> = [];
  let canvasChildrenUpdated = false;
  let overlayChildrenUpdated = false;

  // Check if canvas child props have changed
  if (filteredChildren.canvas.length !== contextValue.canvas.length) {
    canvasChildren = filteredChildren.canvas;
    canvasChildrenUpdated = true;
  } else {
    // Use new components only for canvas children that have changed
    filteredChildren.canvas.forEach((child, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prevChild = contextValue.canvas[index]!;
      if (
        !deepMemoComparator({
          include: ['graph', 'settings', 'renderers'],
          shallow: ['graph']
        })(prevChild.props, child.props)
      ) {
        canvasChildren[index] = child;
        canvasChildrenUpdated = true;
      } else {
        canvasChildren[index] = prevChild;
      }
    });
    // Reuse old components if no canvas children have changed
    if (!canvasChildrenUpdated) {
      canvasChildren = contextValue.canvas;
    }
  }

  // Check if overlay child props have changed
  if (filteredChildren.overlay.length !== contextValue.overlay.length) {
    overlayChildren = filteredChildren.overlay;
    overlayChildrenUpdated = true;
  } else {
    // Use new components only for overlay children that have changed
    filteredChildren.overlay.forEach((child, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prevChild = contextValue.overlay[index]!;
      if (!deepMemoComparator()(prevChild.props, child.props)) {
        overlayChildren[index] = child;
        overlayChildrenUpdated = true;
      } else {
        overlayChildren[index] = prevChild;
      }
    });
    // Reuse old components if no overlay children have changed
    if (!overlayChildrenUpdated) {
      overlayChildren = contextValue.overlay;
    }
  }

  // Return the new context value if any children have changed
  if (canvasChildrenUpdated || overlayChildrenUpdated) {
    return {
      canvas: canvasChildren,
      overlay: overlayChildren
    };
  }
  // Return the old context value if no children have changed
  return contextValue;
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
  const [value, setValue] = useState<GraphViewChildrenContextType<V, E, P>>({
    canvas: [],
    overlay: []
  });

  useEffect(() => {
    setValue(getUpdatedContextValue(graphViewChildren, value));
  }, [graphViewChildren]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <GraphViewChildrenContext.Provider value={value as any}>
      {children}
    </GraphViewChildrenContext.Provider>
  );
}
