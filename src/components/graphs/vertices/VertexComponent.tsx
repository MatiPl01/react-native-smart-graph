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
  animationSettings: AnimationSettingsWithDefaults;
  componentSettings: DeepRequiredAll<VertexSettings>;
  onRemove: VertexRemoveHandler;
  onRender: VertexRenderHandler;
  removed: boolean;
  renderer: VertexRenderFunction<V>;
  vertex: Vertex<V, E>;
};

function VertexComponent<V, E>({
  animationSettings,
  componentSettings,
  onRemove,
  onRender,
  removed,
  renderer,
  vertex
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

  // FOCUS
  // Vertex focus progress
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, {
      currentRadius,
      focusProgress,
      position: { x: positionX, y: positionY },
      scale
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
    animationProgress,
    currentRadius,
    data: vertex.value,
    focusProgress,
    key,
    position: { x: positionX, y: positionY },
    radius: componentSettings.radius,
    scale
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
