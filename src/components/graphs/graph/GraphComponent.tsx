import { Mask } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { useCanvasContexts } from '@/providers/graph/contexts';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphEdgesMask from './GraphEdgesMask';
import GraphVertices from './GraphVertices';

function GraphComponent() {
  // CONTEXTS
  const {
    dataContext: { boundingRect },
    focusContext
  } = useCanvasContexts();

  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusContext);

  return (
    <>
      <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges focusProgress={focusProgress} />
      </Mask>
      <GraphVertices focusContext={focusContext} />
      <GraphEdgesLabels focusProgress={focusProgress} />
    </>
  );
}

export default memo(GraphComponent);
