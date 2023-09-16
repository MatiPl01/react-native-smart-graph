import { Group, Transforms2d } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import {
  VertexComponentProps,
  VertexRenderer,
  VertexRendererProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';
import { calcValueOnProgress } from '@/utils/views';

function VertexComponent<V>({
  data: { animationSettings, points, removed, transformProgress, ...restData },
  focusContext,
  multiStepFocusContext,
  onRemove,
  renderer,
  settings: { radius: r }
}: VertexComponentProps<V>) {
  const { key, scale } = restData;

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

  // TRANSFORM
  // Vertex transform
  const transform = useSharedValue<Transforms2d>([{ scale: 0 }]);

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

  // Vertex transform handler
  useAnimatedReaction(
    () => ({
      points: points.value,
      progress: transformProgress.value,
      scales: {
        internal: scale.value
      }
    }),
    ({ points: { source, target }, progress, scales }) => {
      const s = Math.max(0, scales.internal);
      transform.value = [
        { scale: s },
        ...(s > 0
          ? [
              {
                translateX:
                  calcValueOnProgress(progress, source.x, target.x) / s
              },
              {
                translateY:
                  calcValueOnProgress(progress, source.y, target.y) / s
              }
            ]
          : [])
      ];
    }
  );

  // Render the vertex component
  return (
    <Group transform={transform}>
      <RenderedVertexComponent
        {...restData}
        animationProgress={animationProgress}
        focus={focusProp}
        multiStepFocus={multiStepFocusContext}
        r={r}
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
