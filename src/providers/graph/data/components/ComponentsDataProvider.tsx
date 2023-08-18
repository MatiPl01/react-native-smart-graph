import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { REMOVE_COMPONENTS_TIMEOUT } from '@/constants/timeouts';
import { useGraphObserver } from '@/hooks';
import { withGraphSettings } from '@/providers/graph/data/settings';
import { GraphComponentsData } from '@/types/components';
import { EdgeRemoveHandler, VertexRemoveHandler } from '@/types/data';
import { Graph } from '@/types/models';
import { AllGraphAnimationsSettings } from '@/types/settings';
import { withMemoContext } from '@/utils/contexts';

import {
  ComponentsData,
  createContextValue,
  updateContextValue
} from './utils';

const GraphComponentsDataContext = createContext(null as unknown as object);

export const withComponentsData = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphComponentsData<V, E>) => R
) =>
  withMemoContext(
    Component,
    GraphComponentsDataContext as unknown as Context<GraphComponentsData<V, E>>,
    selector
  );

type ComponentsDataProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  graphAnimationsSettings: AllGraphAnimationsSettings;
  renderLabels: boolean;
}>;

function ComponentsDataProvider<V, E>({
  children,
  graph,
  graphAnimationsSettings,
  renderLabels
}: ComponentsDataProviderProps<V, E>) {
  // GRAPH OBSERVER
  const [state] = useGraphObserver(graph);

  // HELPER VARIABLES
  // Store keys of removed vertices for which the removal animation
  // has been completed and vertices are waiting to be unmounted
  const removedVertices = useMemo(() => new Set<string>(), []);
  // Store keys of removed edges for which the removal animation
  // has been completed and edges are waiting to be unmounted
  const removedEdges = useMemo(() => new Set<string>(), []);

  // Other values
  const removeComponentsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getComponentsData = () => ({
    connections: graph.connections,
    graphAnimationsSettings,
    isGraphDirected: graph.isDirected(),
    removedEdges,
    removedVertices,
    renderLabels,
    state
  });

  // COMPONENTS DATA
  const [componentsData, setComponentsData] =
    useState<ComponentsData<V, E>>(getComponentsData);
  // This useState is a tricky way to force remove vertices and edges
  // that wait for removal after the remove timeout has passed
  const [forceRemove, setForceRemove] = useState({});

  // REMOVE HANDLERS
  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    removedVertices.add(key);
    startComponentsRemoveTimeout();
  }, []);

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    removedEdges.add(key);
    startComponentsRemoveTimeout();
  }, []);

  // CONTEXT VALUE
  const [contextValue, setContextValue] = useState(() =>
    createContextValue(componentsData, {
      handleEdgeRemove,
      handleVertexRemove
    })
  );

  useEffect(() => {
    const newData = getComponentsData();
    setContextValue(value =>
      updateContextValue(value, newData, componentsData)
    );
    setComponentsData(newData);
  }, [state, graphAnimationsSettings, renderLabels, forceRemove]);

  const startComponentsRemoveTimeout = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clearTimeout(removeComponentsTimeoutRef.current!);
    removeComponentsTimeoutRef.current = setTimeout(() => {
      setForceRemove({});
      removeComponentsTimeoutRef.current = null;
    }, REMOVE_COMPONENTS_TIMEOUT);
  };

  return (
    <GraphComponentsDataContext.Provider value={contextValue}>
      {children}
    </GraphComponentsDataContext.Provider>
  );
}

export default withGraphSettings(
  ComponentsDataProvider,
  ({ graph, renderers, settings }) => ({
    graph,
    graphAnimationsSettings: settings.animations,
    renderLabels: !!renderers.label
  })
);
