import { useMemo } from 'react';

import { EdgeComponent } from '@/components/graphs/edges';
import { withComponentsData } from '@/providers/graph';
import { withGraphSettings } from '@/providers/graph/data';
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
    <>
      {Object.values(edgesData).map(data => (
        <EdgeComponent<V, E>
          data={data}
          edgeType={edgeType}
          focusProgress={focusProgress}
          key={data.key}
          onRemove={onRemove}
          renderers={renderers}
          settings={settings}
        />
      ))}
    </>
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdges, ({ edgesData, handleEdgeRemove }) => ({
    edgesData,
    onRemove: handleEdgeRemove
  })),
  ({ componentsSettings, edgeType, renderers }) => ({
    arrowRenderer: renderers.arrow,
    edgeRenderer: renderers.edge,
    edgeType,
    labelRenderer: renderers.label,
    settings: componentsSettings
  })
);
