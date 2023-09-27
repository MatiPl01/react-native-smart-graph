import { Group } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus, useVertexTransform } from '@/hooks';
import {
  VertexComponentProps,
  VertexRenderer,
  VertexRendererProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

function VertexComponent<V>({
  data,
  focusContext,
  multiStepFocusContext,
  onRemove,
  renderer,
  settings: { radius: r }
}: VertexComponentProps<V>) {
  const { animationSettings, removed, value, ...restData } = data;
  const { key } = restData;

  // ANIMATION
  // Vertex render animation progress
  // Use a helper value to ensure that the animation progress is never negative (for specific easing functions)
  const animationProgressHelper = useSharedValue(0);

  // FOCUS
  // Vertex focus progress
  const focusProgress = useSharedValue(0);

  // TRANSFORM
  // Vertex transform
  const transform = useVertexTransform(data, [
    () => ({}),
    ({ transform: { scale, x, y } }) => {
      'worklet';
      data.label.transform.value = [
        { scale },
        ...(scale > 0 ? [{ translateX: x }, { translateY: y }] : [])
      ];
    }
  ]);

  // VERTEX PROPS
  const focusProp = useMemo(
    () => ({
      key: focusContext.focus.key,
      progress: focusProgress
    }),
    []
  );

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusContext, key);

  // Vertex animation handler
  useEffect(() => {
    updateComponentAnimationState(
      key,
      animationProgressHelper,
      animationSettings,
      removed,
      () => {
        onRemove(key);
      }
    );
  }, [removed]);

  useAnimatedReaction(
    () => animationProgressHelper.value,
    progress => {
      data.animationProgress.value = progress;
    }
  );

  return (
    <Group transform={transform}>
      <RenderedVertexComponent
        {...restData}
        focus={focusProp}
        multiStepFocus={multiStepFocusContext}
        r={r}
        renderer={renderer}
        value={value as V}
        vertexKey={key}
      />
    </Group>
  );
}

type RenderedVertexComponentProps<V> = Omit<VertexRendererProps<V>, 'key'> & {
  renderer: VertexRenderer<V>;
  vertexKey: string;
};

const RenderedVertexComponent = memo(function RenderedVertexComponent<V>({
  renderer,
  vertexKey: key,
  ...restProps
}: RenderedVertexComponentProps<V>) {
  return renderer({ key, ...restProps });
}) as <V>(props: RenderedVertexComponentProps<V>) => JSX.Element;

export default memo(VertexComponent) as <V>(
  props: VertexComponentProps<V>
) => JSX.Element;
