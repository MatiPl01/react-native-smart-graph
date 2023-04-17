import { memo, useEffect } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { VertexRenderFunction } from '@/types/renderer';
import { GraphVertexSettings } from '@/types/settings';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<GraphVertexSettings>;
  placementPosition: { x: number; y: number };
  setAnimatedPosition: (
    key: string,
    position: { x: SharedValue<number>; y: SharedValue<number> }
  ) => void;
  renderer: VertexRenderFunction<V>;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  placementPosition,
  setAnimatedPosition,
  renderer
}: VertexComponentProps<V, E>) {
  const x = useSharedValue(placementPosition.x);
  const y = useSharedValue(placementPosition.y);

  useEffect(() => {
    x.value = placementPosition.x;
    y.value = placementPosition.y;

    setAnimatedPosition(vertex.key, { x, y });
  }, [vertex.key, placementPosition]);

  return renderer({
    key: vertex.key,
    data: vertex.value,
    radius: settings.radius,
    position: { x, y }
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
