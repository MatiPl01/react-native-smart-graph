import { Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import { EdgeComponent } from '@/components/graphs/edges';
import { GraphEdgesProps } from '@/types/components';

function GraphEdges<V, E>({
  arrowSettings,
  edgeSettings,
  edgesData,
  focusProgress,
  labelSettings,
  ...restProps
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

  return (
    <Group opacity={opacity}>
      {Object.values(edgesData).map(data => (
        <EdgeComponent<V, E>
          {...{
            ...restProps,
            ...data,
            key: data.edge.key,
            settings
          }}
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
  ({ renderers, settings }) => ({
    arrowRenderer: renderers.arrow,
    arrowSettings: settings.components.arrow,
    edgeRenderer: renderers.edge,
    edgeSettings: settings.components.edge,
    labelRenderer: renderers.label,
    labelSettings: settings.components.label
  })
);
