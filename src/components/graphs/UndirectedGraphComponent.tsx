import { useMemo } from 'react';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';

import GraphComponent, { TempProps } from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; vertices: [string, string]; data: E }>;
  settings?: UndirectedGraphSettings<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
};

function UndirectedGraphComponent<V, E>({
  vertices,
  edges,
  settings,
  renderers,
  onMeasure
}: UndirectedGraphComponentProps<V, E> & TempProps) {
  const graph = useMemo(() => {
    const g = new UndirectedGraph<V, E>();
    const vertexRadius =
      settings?.components?.vertex?.radius ?? VERTEX_COMPONENT_SETTINGS.radius;

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data, vertexRadius);
    });

    edges.forEach(({ key, vertices: [v1, v2], data }) => {
      g.insertEdge(v1, v2, key, data);
    });

    return g;
  }, [vertices, edges]);

  return (
    <GraphComponent
      graph={graph}
      settings={settings}
      renderers={renderers}
      onMeasure={onMeasure}
    />
  );
}

export default <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
  return (
    <UndirectedGraphComponent
      {...(props as UndirectedGraphComponentProps<V, E> & TempProps)}
    />
  );
};
