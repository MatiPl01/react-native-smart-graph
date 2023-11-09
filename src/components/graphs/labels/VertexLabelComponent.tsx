import { Group } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useVertexValueObserver } from '@/hooks';
import {
  VertexLabelComponentProps,
  VertexLabelRenderer,
  VertexLabelRendererProps
} from '@/types/components';
import { Dimensions } from '@/types/layout';
import { VertexObserver } from '@/types/models';
import { getVertexLabelContentTransformation } from '@/utils/transform';

function VertexLabelComponent<V>({
  data: {
    addObserver,
    animationProgress,
    focusProgress,
    removeObserver,
    transform,
    value,
    vertexKey
  },
  focusContext,
  labelPosition,
  multiStepFocusContext,
  renderer,
  vertexRadius
}: VertexLabelComponentProps<V>) {
  // LABEL CONTENT TRANSFORMATION
  const labelDimensions = useSharedValue<Dimensions>({ height: 0, width: 0 });
  const labelContentTransform = useDerivedValue(() =>
    getVertexLabelContentTransformation(
      labelDimensions.value,
      labelPosition.value
    )
  );

  const onMeasure = (width: number, height: number) => {
    labelDimensions.value = { height, width };
  };

  return (
    <Group transform={transform}>
      <Group transform={labelContentTransform}>
        <RenderedLabelComponent
          addObserver={addObserver}
          animationProgress={animationProgress}
          customProps={renderer.props}
          multiStepFocus={multiStepFocusContext}
          r={vertexRadius}
          removeObserver={removeObserver}
          renderer={renderer.renderer}
          value={value as V}
          vertexKey={vertexKey}
          focus={{
            key: focusContext.focus.key,
            progress: focusProgress
          }}
          onMeasure={onMeasure}
        />
      </Group>
    </Group>
  );
}

type RenderedLabelComponentProps<V> = Omit<
  VertexLabelRendererProps<V>,
  'key'
> & {
  addObserver: (observer: VertexObserver<V>) => void;
  removeObserver: (observer: VertexObserver<V>) => void;
  renderer: VertexLabelRenderer<V>;
  vertexKey: string;
};

function RenderedLabelComponent<V>({
  addObserver,
  removeObserver,
  renderer,
  value: initialValue,
  vertexKey: key,
  ...restProps
}: RenderedLabelComponentProps<V>) {
  const value = useVertexValueObserver(
    addObserver,
    removeObserver,
    initialValue
  );

  return renderer({ key, ...restProps, value });
}

export default memo(VertexLabelComponent) as typeof VertexLabelComponent;
