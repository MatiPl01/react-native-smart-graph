import { memo, useEffect } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { VertexFocusContextType } from '@/providers/graph';
import { VertexRemoveHandler, VertexRenderHandler } from '@/types/components';
import { Vertex } from '@/types/graphs';
import { VertexRenderFunction } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  VertexSettings
} from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = VertexFocusContextType & {
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
  focusKey,
  focusTransitionProgress,
  onRemove,
  onRender,
  removed,
  renderer,
  vertex
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // ANIMATION
  // Vertex render animation progress
  // Use a helper value to ensure that the animation progress is never negative
  const animationProgressHelper = useSharedValue(0);
  const animationProgress = useDerivedValue(() =>
    Math.max(0, animationProgressHelper.value)
  );

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

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusTransitionProgress, focusKey, key);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, {
      currentRadius,
      position: { x: positionX, y: positionY },
      scale
    });
  }, [key]);

  useEffect(() => {
    updateComponentAnimationState(
      key,
      animationProgressHelper,
      animationSettings,
      removed,
      onRemove
    );
  }, [removed, animationSettings]);

  // Render the vertex component
  return renderer({
    animationProgress,
    currentRadius,
    focusKey,
    focusTransitionProgress: focusProgress,
    key,
    position: { x: positionX, y: positionY },
    radius: componentSettings.radius,
    scale,
    value: vertex.value
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
