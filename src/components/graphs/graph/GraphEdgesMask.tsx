import { Circle, Rect } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { VertexComponentData } from '@/types/data';
import { AnimatedBoundingRect } from '@/types/layout';

type GraphEdgesMaskProps<V> = {
  boundingRect: AnimatedBoundingRect;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
};

function GraphEdgesMask<V>({
  boundingRect,
  vertexRadius,
  verticesData
}: GraphEdgesMaskProps<V>) {
  const {
    bottom: bottomBound,
    left: leftBound,
    right: rightBound,
    top: topBound
  } = boundingRect;
  const width = useDerivedValue(() => rightBound.value - leftBound.value);
  const height = useDerivedValue(() => bottomBound.value - topBound.value);

  return (
    <>
      <Rect
        color='white'
        height={height}
        width={width}
        x={boundingRect.left}
        y={boundingRect.top}
      />
      {Object.entries(verticesData).map(([key, data]) => (
        <VertexMask data={data} key={key} radius={vertexRadius} />
      ))}
    </>
  );
}

type VertexMaskProps<V> = {
  data: VertexComponentData<V>;
  radius: number;
};

const VertexMask = memo(function <V>({ radius }: VertexMaskProps<V>) {
  // TODO update this after changes
  // const transform = useDerivedValue(() =>
  //   data.displayed.value === false ? 0 : data.currentRadius.value
  // );

  return <Circle color='black' r={radius} />;
});

export default withGraphSettings(
  withComponentsData(GraphEdgesMask, ({ verticesData }) => ({
    verticesData
  })),
  ({ componentSettings }) => ({
    vertexRadius: componentSettings.vertex.radius
  })
);
