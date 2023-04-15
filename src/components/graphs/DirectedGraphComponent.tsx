import { useMemo } from 'react';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';

import GraphComponent, { TempProps } from './GraphComponent';

type DirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  settings?: DirectedGraphSettings<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  settings,
  renderers,
  onMeasure
}: DirectedGraphComponentProps<V, E> & TempProps) {
  const graph = useMemo(() => {
    const g = new DirectedGraph<V, E>();
    const vertexRadius =
      settings?.components?.vertex?.radius ?? VERTEX_COMPONENT_SETTINGS.radius;

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data, vertexRadius);
    });

    edges.forEach(({ key, from, to, data }) => {
      g.insertEdge(from, to, key, data);
    });
    return g;
  }, [vertices, edges]);

  return (
    <GraphComponent
      graph={graph}
      renderers={renderers}
      settings={settings}
      onMeasure={onMeasure}
    />
  );
}

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> & TempProps)}
    />
  );
};
