import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
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
  data: {
    animationSettings,
    displayed,
    key,
    position: { x, y },
    removed,
    scale,
    ...restData
  },
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

  const vertexStyle = useAnimatedStyle(() => {
    const r = settings.radius.value;

    return {
      transform: [{ translateX: x.value - r }, { translateY: y.value - r }]
    };
  });

  // Render the vertex component
  return (
    <Animated.View style={[styles.vertex, vertexStyle]}>
      <RenderedVertexComponent
        {...restProps}
        {...restData}
        {...settings}
        // TODO - remove excessive props
        animationProgress={animationProgress}
        focusKey={focusContext.focus.key}
        focusProgress={focusProgress}
        renderer={renderer}
        scale={scale}
        vertexKey={key}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vertex: {
    position: 'absolute'
  }
});

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
