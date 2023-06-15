import { memo, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { VertexRemoveHandler, VertexRenderHandler } from '@/types/components';
import { Vertex } from '@/types/graphs';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettings
} from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  renderer: VertexRenderFunction<V>;
  componentSettings: DeepRequiredAll<VertexSettings>;
  animationSettings: AnimationSettingsWithDefaults;
  removed: boolean;
  onRender: VertexRenderHandler;
  onRemove: VertexRemoveHandler;
};

function VertexComponent<V, E>({
  vertex,
  renderer,
  removed,
  onRender,
  onRemove,
  animationSettings,
  componentSettings
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // ANIMATION
  // Vertex render animation progress
  const animationProgress = useSharedValue(0);

  // POSITION
  // Current vertex position
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  // SCALE AND RADIUS
  // Current vertex scale
  const scale = useSharedValue(1);
  // Current vertex radius
  const currentRadius = useSharedValue(0);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, {
      position: { x: positionX, y: positionY },
      scale,
      currentRadius
    });
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
    scale,
    position: { x: positionX, y: positionY },
    currentRadius,
    data: vertex.value,
    radius: componentSettings.radius,
    animationProgress
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
