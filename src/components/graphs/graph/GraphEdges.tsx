import { Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

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
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const renderers = useMemo(
    () => ({ arrow: arrowRenderer, edge: edgeRenderer, label: labelRenderer }),
    [arrowRenderer, edgeRenderer, labelRenderer]
  );

  return (
    <Group opacity={opacity}>
      {Object.values(edgesData).map(data => (
        <EdgeComponent<V, E>
          data={data}
          edgeType={edgeType}
          key={data.key}
          onRemove={onRemove}
          renderers={renderers}
          settings={settings}
        />
      ))}
    </Group>
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdges, ({ edgesData, handleEdgeRemove }) => ({
    edgesData,
    onRemove: handleEdgeRemove
  })),
  ({ componentSettings, edgeType, renderers }) => ({
    arrowRenderer: renderers.arrow,
    edgeRenderer: renderers.edge,
    edgeType,
    labelRenderer: renderers.label,
    settings: componentSettings
  })
);
