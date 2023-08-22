// TODO - re-implement this component
import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { withComponentsData } from '@/providers/graph';
import { VertexComponentData } from '@/types/data';
import { AnimatedBoundingRect } from '@/types/layout';

type GraphEdgesMaskProps<V> = {
  boundingRect: AnimatedBoundingRect;
  verticesData: Record<string, VertexComponentData<V>>;
};

function GraphEdgesMask<V>({
  boundingRect,
  verticesData
}: GraphEdgesMaskProps<V>) {
  const width = useDerivedValue(
    () => boundingRect.right.value - boundingRect.left.value
  );
  const height = useDerivedValue(
    () => boundingRect.bottom.value - boundingRect.top.value
  );

  return null;

  // return (
  //   <>
  //     <Rect
  //       color='white'
  //       height={height}
  //       width={width}
  //       x={boundingRect.left}
  //       y={boundingRect.top}
  //     />
  //     {Object.entries(verticesData).map(([key, data]) => (
  //       <VertexMask data={data} key={key} />
  //     ))}
  //   </>
  // );
}

const VertexMask = memo(function <V>({
  data
}: {
  data: VertexComponentData<V>;
}) {
  const radius = useDerivedValue(() =>
    data.displayed.value === false ? 0 : data.currentRadius.value
  );

  return null;

  // return (
  //   <Circle
  //     color='black'
  //     cx={data.position.x}
  //     cy={data.position.y}
  //     r={radius}
  //   />
  // );
});

export default withComponentsData(GraphEdgesMask, ({ verticesData }) => ({
  verticesData
}));
