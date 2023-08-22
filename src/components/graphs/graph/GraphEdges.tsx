import { useMemo } from 'react';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import { EdgeComponent } from '@/components/graphs/edges';
import { Box } from '@/components/utils';
import { withComponentsData } from '@/providers/graph';
import { withGraphSettings } from '@/providers/graph/data';
import { GraphEdgesProps } from '@/types/components';

function GraphEdges<V, E>({
  arrowRenderer,
  arrowSettings,
  edgeRenderer,
  edgeSettings,
  edgesData,
  focusProgress,
  labelRenderer,
  labelSettings,
  onRemove
}: GraphEdgesProps<V, E>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const settings = useMemo(
    () => ({
      arrow: arrowSettings,
      edge: edgeSettings,
      label: labelSettings
    }),
    [arrowSettings, edgeSettings, labelSettings]
  );

  const renderers = useMemo(
    () => ({ arrow: arrowRenderer, edge: edgeRenderer, label: labelRenderer }),
    [arrowRenderer, edgeRenderer, labelRenderer]
  );

  return (
    <Box opacity={opacity}>
      {Object.values(edgesData).map(data => (
        <EdgeComponent<V, E>
          data={data}
          key={data.key}
          onRemove={onRemove}
          renderers={renderers}
          settings={settings}
        />
      ))}
    </Box>
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdges, ({ edgesData, handleEdgeRemove }) => ({
    edgesData,
    onRemove: handleEdgeRemove
  })),
  ({ renderers, settings }) => ({
    arrowRenderer: renderers.arrow,
    arrowSettings: settings.components.arrow,
    edgeRenderer: renderers.edge,
    edgeSettings: settings.components.edge,
    labelRenderer: renderers.label,
    labelSettings: settings.components.label
  })
);
