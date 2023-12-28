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
  labelSettings,
  labelsRendered,
  onRemove,
  vertexSettings
}: GraphEdgesProps<V, E>) {
  const renderers = useMemo(
    () => ({ arrow: arrowRenderer, edge: edgeRenderer }),
    [arrowRenderer, edgeRenderer]
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
        labelsRendered={labelsRendered}
        renderers={renderers}
        settings={settings}
        onRemove={onRemove}
      />
    ))
  );
}

export default withGraphSettings(
  withComponentsData(
    GraphEdges,
    ({ edgeLabelsRendered, edgesData, handleEdgeRemove }) => ({
      edgesData,
      labelsRendered: edgeLabelsRendered,
      onRemove: handleEdgeRemove
    })
  ),
  ({ componentsSettings, edgeType, renderers }) => ({
    arrowRenderer: renderers.edgeArrow,
    arrowSettings: componentsSettings.edgeArrow,
    edgeRenderer: renderers.edge,
    edgeSettings: componentsSettings.edge,
    edgeType,
    labelSettings: componentsSettings.edgeLabel,
    vertexSettings: componentsSettings.vertex
  })
);
