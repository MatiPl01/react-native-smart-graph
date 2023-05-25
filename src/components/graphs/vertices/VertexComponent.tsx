import { memo, useEffect } from 'react';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { VertexSettings } from '@/types/settings';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<VertexSettings>;
  renderer: VertexRenderFunction<V>;
  removed: boolean;
  onRender: (
    key: string,
    positions: {
      displayed: AnimatedVectorCoordinates;
      target: AnimatedVectorCoordinates;
    }
  ) => void;
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
  // Displayed vertex position (where it is rendered)
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  // Placement vertex position (where it should be rendered in the calculated layout)
  const targetX = useSharedValue(0);
  const targetY = useSharedValue(0);

  // ANIMATION
  // Vertex render animation progress
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, {
      displayed: { x: positionX, y: positionY },
      target: { x: targetX, y: targetY }
    });
  }, [key]);

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
    animationProgress
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
