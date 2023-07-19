import { Mask, Rect } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { useVertexFocusContext } from '@/providers/graph';
import { AnimatedBoundingRect } from '@/types/layout';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphEdgesMask from './GraphEdgesMask';
import GraphVertices from './GraphVertices';

type GraphComponentProps = {
  boundingRect: AnimatedBoundingRect;
};

function GraphComponent({ boundingRect }: GraphComponentProps) {
  const { focusKey, focusTransitionProgress } = useVertexFocusContext();
  // Helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusTransitionProgress, focusKey);

  // TODO - remove after testing
  const w = useDerivedValue(
    () => boundingRect.right.value - boundingRect.left.value
  );
  const h = useDerivedValue(
    () => boundingRect.bottom.value - boundingRect.top.value
  );

  return (
    <>
      {/* TODO - remove after testing */}
      <Rect
        color='#333'
        height={h}
        width={w}
        x={boundingRect.left}
        y={boundingRect.top}
      />
      <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges focusProgress={focusProgress} />
      </Mask>
      <GraphVertices />
      <GraphEdgesLabels focusProgress={focusProgress} />
    </>
  );
}

export default memo(GraphComponent);
