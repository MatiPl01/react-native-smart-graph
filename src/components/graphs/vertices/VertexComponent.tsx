import { memo, useEffect } from 'react';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { GraphVertexSettings } from '@/types/settings';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<GraphVertexSettings>;
  renderer: VertexRenderFunction<V>;
  removed: boolean;
  onRender: (key: string, position: AnimatedVectorCoordinates) => void;
  onRemove: (key: string) => void;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  renderer,
  removed,
  onRender,
  onRemove
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // POSITION
  // Current vertex position
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  // ANIMATION
  // Vertex render animation progress
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, { x: positionX, y: positionY });
  }, [key]);

  const mode = useSharedValue(-1);

  useEffect(() => {
    // ANimate vertex on mount
    if (!removed) {
      // Animate vertex on mount
      animationProgress.value = withTiming(1, {
        // TODO - make this a setting
        duration: 500,
        easing: EASING.bounce
      });
    }
    // Animate vertex removal
    else {
      animationProgress.value = withTiming(
        0,
        {
          duration: 500,
          easing: EASING.bounce
        },
        finished => {
          if (finished) {
            runOnJS(onRemove)(key);
          }
        }
      );
    }
  }, [removed]);

  // Render the vertex component
  return renderer({
    key,
    data: vertex.value,
    radius: settings.radius,
    position: { x: positionX, y: positionY },
    removed,
    animationProgress
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
