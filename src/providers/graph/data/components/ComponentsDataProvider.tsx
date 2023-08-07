import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import { useGraphObserver } from '@/hooks';
import { withGraphSettings } from '@/providers/graph/data/settings';
import { GraphComponentsData } from '@/types/components';
import { EdgeRemoveHandler, VertexRemoveHandler } from '@/types/data';
import { Graph } from '@/types/models';
import { AllGraphAnimationsSettings } from '@/types/settings';
import {
  cancelEdgeAnimations,
  cancelVertexAnimations
} from '@/utils/animations';
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

  // REMOVE HANDLERS
  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    const vertexData = contextValue.verticesData[key];
    if (!vertexData) return;
    cancelVertexAnimations(vertexData);
    removedVertices.add(key);
  }, []);

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    const edgeData = contextValue.edgesData[key];
    if (!edgeData) return;
    cancelEdgeAnimations(edgeData);
    removedEdges.add(key);
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
  }, [state, graphAnimationsSettings, renderLabels]);

  useEffect(() => {
    console.log('>>> COMPONENTS DATA UPDATE');
  }, [contextValue]);

  console.log('____ PROBE ____');

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
