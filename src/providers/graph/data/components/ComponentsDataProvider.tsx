import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import { useGraphObserver } from '@/hooks';
import { withGraphSettings } from '@/providers/graph/data/settings/context';
import { EdgeRemoveHandler, VertexRemoveHandler } from '@/types/components';
import { Graph } from '@/types/graphs';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings';
import {
  cancelEdgeAnimations,
  cancelVertexAnimations
} from '@/utils/animations';

import { GraphComponentsContext } from './context';
import {
  ComponentsData,
  createContextValue,
  updateContextValue
} from './utils';

type ComponentsDataProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  graphAnimationsSettings: GraphAnimationsSettingsWithDefaults;
  renderLabels: boolean;
}>;

function ComponentsDataProvider<V, E>({
  children,
  ...userSettings
}: ComponentsDataProviderProps<V, E>) {
  // GRAPH OBSERVER
  const [state] = useGraphObserver(userSettings.graph);

  // HELPER VARIABLES
  // Store keys of removed vertices for which the removal animation
  // has been completed and vertices are waiting to be unmounted
  const removedVertices = useMemo(() => new Set<string>(), []);
  // Store keys of removed edges for which the removal animation
  // has been completed and edges are waiting to be unmounted
  const removedEdges = useMemo(() => new Set<string>(), []);

  const getComponentsData = () => ({
    connections: userSettings.graph.connections,
    isGraphDirected: userSettings.graph.isDirected(),
    removedEdges,
    removedVertices,
    state,
    ...userSettings
  });

  // COMPONENTS DATA
  const [componentsData, setComponentsData] = useState<ComponentsData<V, E>>(
    getComponentsData()
  );

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
  const [contextValue, setContextValue] = useState(
    createContextValue(componentsData, {
      handleEdgeRemove,
      handleVertexRemove
    })
  );

  useEffect(() => {
    const newData = getComponentsData();
    setContextValue(value =>
      updateContextValue(newData, componentsData, value)
    );
    setComponentsData(newData);
  }, [state, userSettings]);

  return (
    <GraphComponentsContext.Provider value={contextValue}>
      {children}
    </GraphComponentsContext.Provider>
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
