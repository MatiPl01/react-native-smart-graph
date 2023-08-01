import { memo, useEffect } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { FocusContextType } from '@/providers/canvas';
import { VertexComponentData } from '@/types/components';
import { VertexRenderFunction } from '@/types/renderer';
import { VertexSettingsWithDefaults } from '@/types/settings';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = VertexComponentData<V, E> & {
  componentSettings: VertexSettingsWithDefaults;
  focusContext: FocusContextType;
  onRemove: (key: string) => void;
  renderer: VertexRenderFunction<V>;
};

function VertexComponent<V, E>({
  animationSettings,
  componentSettings,
  focusContext,
  onRemove,
  removed,
  renderer,
  vertex,
  ...restProps
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // ANIMATION
  // Vertex render animation progress
  // Use a helper value to ensure that the animation progress is never negative
  const animationProgressHelper = useSharedValue(0);
  const animationProgress = useDerivedValue(() =>
    Math.max(0, animationProgressHelper.value)
  );

  // FOCUS
  // Vertex focus progress
  const focusProgress = useSharedValue(0);

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusContext, key);

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
    ...restProps,
    ...componentSettings,
    animationProgress,
    focusKey: focusContext.focus.key,
    focusProgress,
    key: vertex.key,
    value: vertex.value
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
