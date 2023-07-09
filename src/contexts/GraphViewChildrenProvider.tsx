/* eslint-disable import/no-unused-modules */
import React, { createContext, PropsWithChildren, useContext } from 'react';

type GraphViewChildrenContextType = {
  canvasChildren: React.ReactNode;
  overlayChildren: React.ReactNode;
};

const GraphViewChildrenContext = createContext(null);

export const useGraphViewChildrenContext = () => {
  const contextValue = useContext(GraphViewChildrenContext);

  if (!contextValue) {
    throw new Error(
      'useGraphViewChildrenContext must be used within a GraphViewChildrenProvider'
    );
  }

  return contextValue as GraphViewChildrenContextType;
};

type GraphViewChildrenProviderProps = PropsWithChildren<{
  graphViewChildren: React.ReactNode;
}>;

export default function GraphViewChildrenProvider({
  children,
  graphViewChildren
}: GraphViewChildrenProviderProps) {
  const contextValue: GraphViewChildrenContextType = {
    canvasChildren: graphViewChildren, // TODO
    overlayChildren: null // TODO
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <GraphViewChildrenContext.Provider value={contextValue as any}>
      {children}
    </GraphViewChildrenContext.Provider>
  );
}
