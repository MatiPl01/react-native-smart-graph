import { Group } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import {
  VertexLabelComponentProps,
  VertexLabelRenderer,
  VertexLabelRendererProps
} from '@/types/components';
import { Dimensions } from '@/types/layout';
import { getVertexLabelContentTransformation } from '@/utils/transform';

function VertexLabelComponent<V>({
  data: { animationProgress, focusProgress, transform, value },
  focusContext,
  labelPosition,
  renderer,
  vertexKey,
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
          animationProgress={animationProgress}
          r={vertexRadius}
          renderer={renderer}
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
  renderer: VertexLabelRenderer<V>;
  vertexKey: string;
};

function RenderedLabelComponent<V>({
  renderer,
  vertexKey: key,
  ...restProps
}: RenderedLabelComponentProps<V>) {
  return renderer({ key, ...restProps });
}

export default memo(VertexLabelComponent) as typeof VertexLabelComponent;
