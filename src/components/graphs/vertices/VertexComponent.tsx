import { Group } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import {
  VertexComponentProps,
  VertexRenderer,
  VertexRendererProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

function VertexComponent<V, E>({
  animationSettings,
  displayed,
  focusContext,
  onRemove,
  removed,
  renderer,
  settings,
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

  console.log(vertex.key);

  // FOCUS
  // Vertex focus progress
  const focusProgress = useSharedValue(0);

  // RENDERER PROPS
  const rendererProps = useMemo<VertexRendererProps<V>>(
    () => ({
      ...restProps,
      ...settings,
      animationProgress,
      focusKey: focusContext.focus.key,
      focusProgress,
      key: vertex.key,
      value: vertex.value
    }),
    [settings, vertex]
  );

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusContext, key);

  useEffect(() => {
    if (!removed) displayed.value = true;

    updateComponentAnimationState(
      key,
      animationProgressHelper,
      animationSettings,
      removed,
      () => {
        displayed.value = false;
        onRemove(key);
      }
    );
  }, [removed, animationSettings]);

  // Hide vertices that wait for removal
  const transform = useDerivedValue(() => [{ scale: displayed.value ? 1 : 0 }]);

  // Render the vertex component
  return (
    <Group transform={transform}>
      <RenderedVertexComponent<V> props={rendererProps} renderer={renderer} />
    </Group>
  );
}

type RenderedVertexComponentProps<V> = {
  props: VertexRendererProps<V>;
  renderer: VertexRenderer<V>;
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
