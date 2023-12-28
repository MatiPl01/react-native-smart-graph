import { useMemo } from 'react';

import { VertexComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphVerticesProps } from '@/types/components';

function GraphVertices<V>({
  labelSettings,
  renderer,
  vertexSettings,
  verticesData,
  ...restProps
}: GraphVerticesProps<V>) {
  const settings = useMemo(
    () => ({ label: labelSettings, vertex: vertexSettings }),
    [vertexSettings, labelSettings]
  );

  return (
    renderer &&
    Object.values(verticesData).map(data => (
      <VertexComponent<V>
        {...restProps}
        data={data}
        key={data.key}
        renderer={renderer}
        settings={settings}
      />
    ))
  );
}

export default withGraphSettings(
  withComponentsData(
    GraphVertices,
    ({ handleVertexRemove, vertexLabelsRendered, verticesData }) => ({
      labelsRendered: vertexLabelsRendered,
      onRemove: handleVertexRemove,
      verticesData
    })
  ),
  ({ componentsSettings, renderers }) => ({
    labelSettings: componentsSettings.vertexLabel,
    renderer: renderers.vertex,
    vertexSettings: componentsSettings.vertex
  })
);
