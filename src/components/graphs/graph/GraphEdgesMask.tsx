import { Circle, Rect } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { VertexComponentData } from '@/types/components';
import { AnimatedBoundingRect } from '@/types/layout';
import { withComponentsData } from '@/providers/graph/data/components/context';

type GraphEdgesMaskProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphEdgesMask<V, E>({
  boundingRect,
  verticesData
}: GraphEdgesMaskProps<V, E>) {
  const width = useDerivedValue(
    () => boundingRect.right.value - boundingRect.left.value
  );
  const height = useDerivedValue(
    () => boundingRect.bottom.value - boundingRect.top.value
  );

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
        <VertexMask data={data} key={key} />
      ))}
    </>
  );
}

const VertexMask = memo(function <V, E>({
  data
}: {
  data: VertexComponentData<V, E>;
}) {
  const radius = useDerivedValue(() =>
    data.displayed.value === false ? 0 : data.currentRadius.value
  );

  return (
    <Circle
      color='black'
      cx={data.position.x}
      cy={data.position.y}
      r={radius}
    />
  );
});

export default withComponentsData(GraphEdgesMask, ({ verticesData }) => ({
  verticesData
}));
