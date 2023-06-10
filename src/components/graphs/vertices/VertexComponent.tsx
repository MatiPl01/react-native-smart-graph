import { memo, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { VertexRemoveHandler, VertexRenderHandler } from '@/types/components';
import { Vertex } from '@/types/graphs';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettings
} from '@/types/settings';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  renderer: VertexRenderFunction<V>;
  componentSettings: Required<VertexSettings>;
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
  componentSettings,
  animationSettings
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // Current vertex position
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  // Current vertex scale
  // used to change vertex scale from the outside (e.g. when vertex is selected)
  const scale = useSharedValue(1);
  // Current vertex radius
  // must be updated by the renderer (used to properly position edge arrows, etc.)
  const currentRadius = useSharedValue(0);
  // Vertex render animation progress
  const animationProgress = useSharedValue(0);

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
    data: vertex.value,
    scale,
    radius: componentSettings.radius,
    currentRadius,
    position: { x: positionX, y: positionY },
    animationProgress
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
