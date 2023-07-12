import { createContext, useMemo } from 'react';

type MultiFocusContextType = {
  // TODO
};

const MultiFocusContext = createContext(null as unknown as object);

type MultiFocusProviderProps = {
  children?: React.ReactNode;
};

export default function MultiFocusProvider({
  children
}: MultiFocusProviderProps) {
  const contextValue = useMemo<MultiFocusContextType>(() => ({}), []);

  return (
    <MultiFocusContext.Provider value={contextValue}>
      {children}
    </MultiFocusContext.Provider>
  );
}
