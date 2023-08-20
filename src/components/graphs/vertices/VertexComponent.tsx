import { Group } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import {
  VertexComponentProps,
  VertexRenderer,
  VertexRendererProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

function VertexComponent<V>({
  data: { animationSettings, displayed, key, removed, ...restData },
  focusContext,
  onRemove,
  renderer,
  settings,
  ...restProps
}: VertexComponentProps<V>) {
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
      <RenderedVertexComponent
        {...restProps}
        {...restData}
        {...settings}
        animationProgress={animationProgress}
        focusKey={focusContext.focus.key}
        focusProgress={focusProgress}
        renderer={renderer}
        vertexKey={key}
      />
    </Group>
  );
}

type RenderedVertexComponentProps<V> = Omit<VertexRendererProps<V>, 'key'> & {
  renderer: VertexRenderer<V>;
  vertexKey: string;
};

const RenderedVertexComponent = memo(function <V>({
  renderer,
  vertexKey: key,
  ...restProps
}: RenderedVertexComponentProps<V>) {
  return renderer({ key, ...restProps });
}) as <V>(props: RenderedVertexComponentProps<V>) => JSX.Element;

export default memo(VertexComponent) as <V>(
  props: VertexComponentProps<V>
) => JSX.Element;
