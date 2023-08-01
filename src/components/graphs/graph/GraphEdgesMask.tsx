import { Circle, Rect } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { VertexComponentData } from '@/types/components';
import { AnimatedBoundingRect } from '@/types/layout';

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
        <Circle
          color='black'
          cx={data.position.x}
          cy={data.position.y}
          key={key}
          r={data.currentRadius}
        />
      ))}
    </>
  );
}

export default withGraphData(GraphEdgesMask, ({ verticesData }) => ({
  verticesData
}));
