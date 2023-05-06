import { memo, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { GraphVertexSettings } from '@/types/settings';

type AnimatedPositionSetter = (
  key: string,
  position: AnimatedVectorCoordinates | null
) => void;

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<GraphVertexSettings>;
  renderer: VertexRenderFunction<V>;
  setAnimatedPosition: AnimatedPositionSetter;
  setAnimatedPlacementPosition: AnimatedPositionSetter;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  renderer,
  setAnimatedPosition,
  setAnimatedPlacementPosition
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // Current vertex position
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  // Vertex placement position
  const placementX = useSharedValue(0);
  const placementY = useSharedValue(0);

  useEffect(() => {
    // Add vertex to animated positions if it's added to the graph
    setAnimatedPosition(key, { x: positionX, y: positionY });
    setAnimatedPlacementPosition(key, { x: placementX, y: placementY });

    // Remove vertex from animated positions if it's removed from the graph
    return () => {
      setAnimatedPosition(key, null);
      setAnimatedPlacementPosition(key, null);
    };
  }, [key]);

  // Render the vertex component
  return renderer({
    key,
    data: vertex.value,
    radius: settings.radius,
    position: { x: positionX, y: positionY }
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
