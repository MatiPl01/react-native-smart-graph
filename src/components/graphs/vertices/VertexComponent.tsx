import { Group, Transforms2d } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
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

function VertexComponent<V>({
  data: { animationSettings, removed, ...restData },
  focusContext,
  onRemove,
  renderer,
  settings
}: VertexComponentProps<V>) {
  const {
    key,
    scale,
    transform: { points: transformPoints, progress: transformProgress }
  } = restData;

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
      currentScale: scale.value,
      points: transformPoints.value,
      progress: transformProgress.value
    }),
    ({ currentScale, points: { source, target }, progress }) => {
      transform.value = [
        { scale: Math.max(0, currentScale) },
        { translateX: source.x + (target.x - source.x) * progress },
        { translateY: source.y + (target.y - source.y) * progress }
      ];
    }
  );

  // Render the vertex component
  return (
    <Group transform={transform}>
      <RenderedVertexComponent
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
