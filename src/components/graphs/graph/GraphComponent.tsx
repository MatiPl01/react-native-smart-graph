import { Rect } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { useCanvasContexts } from '@/providers/graph/contexts';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphVertices from './GraphVertices';

function GraphComponent() {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { boundingRect },
    focusContext
  } = useCanvasContexts();

  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusContext);

  const x = useDerivedValue(() => boundingRect.left.value);
  const y = useDerivedValue(() => boundingRect.top.value);
  const w = useDerivedValue(
    () => boundingRect.right.value - boundingRect.left.value
  );
  const h = useDerivedValue(
    () => boundingRect.bottom.value - boundingRect.top.value
  );

  return (
    <>
      <Rect color='#333' height={h} width={w} x={x} y={y} />
      {/* TODO - maybe remove the mask component - it degrades performance */}
      {/* <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges focusProgress={focusProgress} />
      </Mask> */}
      <GraphEdges focusProgress={focusProgress} />
      <GraphEdgesLabels focusProgress={focusProgress} />
      <GraphVertices focusContext={focusContext} />
    </>
  );
}

export default memo(GraphComponent);
