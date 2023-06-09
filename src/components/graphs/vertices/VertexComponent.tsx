import { memo, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettings
} from '@/types/settings';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<VertexSettings>;
  renderer: VertexRenderFunction<V>;
  animationSettings: AnimationSettingsWithDefaults;
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
  onRemove,
  animationSettings
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

  useEffect(() => {
    updateComponentAnimationState(
      key,
      animationProgress,
      animationSettings,
      removed,
      onRemove
    );
  }, [removed, animationSettings]);

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
