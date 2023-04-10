import { memo, useEffect } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { VertexRendererProps } from '@/types/render';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  radius: number;
  placementPosition: { x: number; y: number };
  setAnimatedPosition: (
    key: string,
    position: { x: SharedValue<number>; y: SharedValue<number> }
  ) => void;
  vertexRenderer: (props: VertexRendererProps<V>) => JSX.Element;
};

function VertexComponent<V, E>({
  vertex,
  radius,
  placementPosition,
  setAnimatedPosition,
  vertexRenderer
}: VertexComponentProps<V, E>) {
  const x = useSharedValue(placementPosition.x);
  const y = useSharedValue(placementPosition.y);

  useEffect(() => {
    x.value = placementPosition.x;
    y.value = placementPosition.y;

    setAnimatedPosition(vertex.key, { x, y });
  }, [vertex.key, placementPosition]);

  return vertexRenderer({
    key: vertex.key,
    data: vertex.value,
    radius,
    position: { x, y }
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
