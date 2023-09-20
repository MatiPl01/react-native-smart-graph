import { useMemo } from 'react';

import { EdgeComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphEdgesProps } from '@/types/components';

function GraphEdges<V, E>({
  arrowRenderer,
  arrowSettings,
  edgeRenderer,
  edgeSettings,
  edgeType,
  edgesData,
  focusProgress,
  labelRenderer,
  labelSettings,
  onRemove,
  vertexSettings
}: GraphEdgesProps<V, E>) {
  const renderers = useMemo(
    () => ({ arrow: arrowRenderer, edge: edgeRenderer, label: labelRenderer }),
    [arrowRenderer, edgeRenderer, labelRenderer]
  );

  const settings = useMemo(
    () => ({
      arrow: arrowSettings,
      edge: edgeSettings,
      label: labelSettings,
      vertex: vertexSettings
    }),
    [arrowSettings, edgeSettings, labelSettings, vertexSettings]
  );

  return (
    edgeRenderer &&
    Object.entries(edgesData).map(([key, data]) => (
      <EdgeComponent<V, E>
        data={data}
        edgeType={edgeType}
        focusProgress={focusProgress}
        key={key}
        onRemove={onRemove}
        renderers={renderers}
        settings={settings}
      />
    ))
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdges, ({ edgesData, handleEdgeRemove }) => ({
    edgesData,
    onRemove: handleEdgeRemove
  })),
  ({ componentsSettings, edgeType, renderers }) => ({
    arrowRenderer: renderers.edgeArrow,
    arrowSettings: componentsSettings.edgeArrow,
    edgeRenderer: renderers.edge,
    edgeSettings: componentsSettings.edge,
    edgeType,
    labelRenderer: renderers.edgeLabel,
    labelSettings: componentsSettings.edgeLabel,
    vertexSettings: componentsSettings.vertex
  })
);
