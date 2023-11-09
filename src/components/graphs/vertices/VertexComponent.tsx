import { Group } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus, useVertexTransform } from '@/hooks';
import {
  VertexComponentProps,
  VertexRenderer,
  VertexRendererProps
} from '@/types/components';
import { VertexObserver } from '@/types/models';
import { updateComponentAnimationState } from '@/utils/components';
import { getVertexLabelComponentTransformation } from '@/utils/transform';

function VertexComponent<V>({
  data,
  focusContext,
  labelsRendered,
  multiStepFocusContext,
  onRemove,
  renderer,
  settings: {
    label: labelSettings,
    vertex: { radius: r }
  }
}: VertexComponentProps<V>) {
  const { animationSettings, removed, value, ...restData } = data;
  const { key } = restData;

  // ANIMATION
  // Vertex render animation progress
  // Use a helper value to ensure that the animation progress is never negative (for specific easing functions)
  const animationProgressHelper = useSharedValue(0);

  // TRANSFORM
  // Vertex transform
  const transform = useVertexTransform(data, [
    () => ({ ...labelSettings, labelsRendered }),
    ({
      customProps: { labelsRendered: renderLabels, ...rest },
      transform: { scale: vertexScale, x, y }
    }) => {
      'worklet';
      if (!renderLabels) return;
      data.label.transform.value = getVertexLabelComponentTransformation(
        { x, y },
        r,
        vertexScale,
        rest
      );
    }
  ]);

  // VERTEX PROPS
  const focusProp = useMemo(
    () => ({
      key: focusContext.focus.key,
      progress: data.focusProgress
    }),
    []
  );

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(data.focusProgress, focusContext, key);

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
        customProps={renderer.props}
        focus={focusProp}
        multiStepFocus={multiStepFocusContext}
        r={r}
        renderer={renderer.renderer}
        value={value as V}
        vertexKey={key}
      />
    </Group>
  );
}

type RenderedVertexComponentProps<V> = Omit<VertexRendererProps<V>, 'key'> & {
  addObserver: (observer: VertexObserver<V>) => void;
  removeObserver: (observer: VertexObserver<V>) => void;
  renderer: VertexRenderer<V>;
  vertexKey: string;
};

const RenderedVertexComponent = memo(function RenderedVertexComponent<V>({
  addObserver,
  removeObserver,
  renderer,
  vertexKey: key,
  ...restProps
}: RenderedVertexComponentProps<V>) {
  const vertexObserver = useMemo<VertexObserver<V>>(
    () => ({
      valueChanged: console.log
    }),
    []
  );

  useEffect(() => {
    addObserver(vertexObserver);
    return () => removeObserver(vertexObserver);
  }, [addObserver, removeObserver, vertexObserver]);

  return renderer({ key, ...restProps });
}) as <V>(props: RenderedVertexComponentProps<V>) => JSX.Element;

export default memo(VertexComponent) as <V>(
  props: VertexComponentProps<V>
) => JSX.Element;
