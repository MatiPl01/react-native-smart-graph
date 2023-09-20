import { useMemo } from 'react';

import { EdgeComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphEdgesProps } from '@/types/components';

function GraphEdges<V, E>({
  arrowRenderer,
  edgeRenderer,
  edgeType,
  edgesData,
  focusProgress,
  labelRenderer,
  onRemove,
  settings
}: GraphEdgesProps<V, E>) {
  const renderers = useMemo(
    () => ({ arrow: arrowRenderer, edge: edgeRenderer, label: labelRenderer }),
    [arrowRenderer, edgeRenderer, labelRenderer]
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
    edgeRenderer: renderers.edge,
    edgeType,
    labelRenderer: renderers.edgeLabel,
    settings: componentsSettings
  })
);
