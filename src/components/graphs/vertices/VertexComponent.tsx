import { memo, useEffect, useMemo, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { FocusContextType } from '@/providers/canvas';
import { VertexComponentData, VertexRemoveHandler } from '@/types/components';
import { VertexRendererProps, VertexRenderFunction } from '@/types/renderer';
import { VertexSettingsWithDefaults } from '@/types/settings';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = VertexComponentData<V, E> & {
  componentSettings: VertexSettingsWithDefaults;
  focusContext: FocusContextType;
  onRemove: VertexRemoveHandler;
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
  const [displayed, setDisplayed] = useState(true);

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

  // RENDERER PROPS
  const rendererProps = useMemo<VertexRendererProps<V>>(
    () => ({
      ...restProps,
      ...componentSettings,
      animationProgress,
      focusKey: focusContext.focus.key,
      focusProgress,
      key: vertex.key,
      value: vertex.value
    }),
    [componentSettings, vertex]
  );

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusContext, key);

  useEffect(() => {
    if (!removed) setDisplayed(true);

    updateComponentAnimationState(
      key,
      animationProgressHelper,
      animationSettings,
      removed,
      () => {
        setDisplayed(false);
        onRemove(key);
      }
    );
  }, [removed, animationSettings]);

  // Render the vertex component
  return displayed ? (
    <RenderedVertexComponent<V> props={rendererProps} renderer={renderer} />
  ) : null;
}

type RenderedVertexComponentProps<V> = {
  props: VertexRendererProps<V>;
  renderer: VertexRenderFunction<V>;
};

const RenderedVertexComponent = memo(function <V>({
  props,
  renderer
}: RenderedVertexComponentProps<V>) {
  return renderer(props);
}) as <V>(props: RenderedVertexComponentProps<V>) => JSX.Element;

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
