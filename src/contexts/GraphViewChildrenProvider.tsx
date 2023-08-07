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

import { deepMemoComparator } from '@/utils/objects';

type GraphViewChildrenContextType = {
  canvas: Array<React.ReactElement<Record<string, any>>>;
  overlay: Array<React.ReactElement<Record<string, any>>>;
};

const GraphViewChildrenContext = createContext(null as unknown as object);

export const useGraphViewChildrenContext = () => {
  const contextValue = useContext(GraphViewChildrenContext);

  if (!contextValue) {
    throw new Error(
      'useGraphViewChildrenContext must be used within a GraphViewChildrenProvider'
    );
  }

  return contextValue as GraphViewChildrenContextType;
};

const CANVAS_COMPONENTS = [
  'DirectedGraphComponent',
  'UndirectedGraphComponent'
];

const filterChildren = (
  children: React.ReactNode
): GraphViewChildrenContextType => {
  const canvas: Array<React.ReactElement<Record<string, any>>> = [];
  const overlay: Array<React.ReactElement<Record<string, any>>> = [];

  Children.forEach(children, child => {
    if (isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const childName = (child?.type as any)?.type?.name as string;
      if (CANVAS_COMPONENTS.includes(childName)) {
        canvas.push(child as React.ReactElement<Record<string, any>>);
      } else {
        overlay.push(child as React.ReactElement<Record<string, any>>);
      }
    }
  });

  return {
    canvas,
    overlay
  };
};

const getUpdatedContextValue = (
  children: React.ReactNode,
  contextValue: GraphViewChildrenContextType
): GraphViewChildrenContextType => {
  const filteredChildren = filterChildren(children);

  let canvasChildren: Array<React.ReactElement<Record<string, any>>> = [];
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

export default function GraphViewChildrenProvider({
  children,
  graphViewChildren
}: GraphViewChildrenProviderProps) {
  const [value, setValue] = useState<GraphViewChildrenContextType>({
    canvas: [],
    overlay: []
  });

  useEffect(() => {
    setValue(getUpdatedContextValue(graphViewChildren, value));
  }, [graphViewChildren]);

  return (
    <GraphViewChildrenContext.Provider value={value}>
      {children}
    </GraphViewChildrenContext.Provider>
  );
}
