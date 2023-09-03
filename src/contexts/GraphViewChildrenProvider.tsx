/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

type ViewChild = React.ReactElement<Record<string, any>>;
type ViewChildren = Array<ViewChild>;

type GraphViewChildrenContextType = {
  canvas: ViewChildren;
  overlay: ViewChildren;
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
  const canvas: ViewChildren = [];
  const overlay: ViewChildren = [];

  Children.forEach(children, child => {
    if (isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const childName = (child?.type as any)?.type?.name as string;
      if (CANVAS_COMPONENTS.includes(childName)) {
        canvas.push(child as ViewChild);
      } else {
        overlay.push(child as ViewChild);
      }
    }
  });

  return {
    canvas,
    overlay
  };
};

const updateComponents = (
  filteredChildren: ViewChildren,
  previousChildren: ViewChildren,
  comparator: (
    prevProps: Record<string, any>,
    nextProps: Record<string, any>
  ) => boolean
): ViewChildren => {
  let isModified = false;
  const newChildren: ViewChildren = [];

  // Check if child props have changed
  if (filterChildren.length !== previousChildren.length) {
    return filteredChildren;
  }

  // Use new components only for children that have changed
  for (let i = 0; i < filteredChildren.length; i++) {
    const child = filteredChildren[i]!;
    const prevChild = previousChildren[i]!;
    if (!comparator(prevChild.props, child.props)) {
      newChildren[i] = child;
      isModified = true;
    } else {
      newChildren[i] = prevChild;
    }
  }

  return isModified ? newChildren : previousChildren;
};

const getUpdatedContextValue = (
  children: React.ReactNode,
  contextValue: GraphViewChildrenContextType
): GraphViewChildrenContextType => {
  const filteredChildren = filterChildren(children);

  const canvasChildren = updateComponents(
    filteredChildren.canvas,
    contextValue.canvas,
    deepMemoComparator({
      shallow: ['graph']
    })
  );

  const overlayChildren = updateComponents(
    filteredChildren.overlay,
    contextValue.overlay,
    deepMemoComparator({
      shallow: ['graph']
    })
  );

  // Return the new context value if any children have changed
  if (
    contextValue.canvas !== canvasChildren ||
    contextValue.overlay !== overlayChildren
  ) {
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
