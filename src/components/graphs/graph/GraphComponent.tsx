import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { useCanvasContexts } from '@/providers/graph/contexts';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphVertices from './GraphVertices';

function GraphComponent() {
  // CONTEXTS
  // Canvas contexts
  const { focusContext } = useCanvasContexts();

  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusContext);

  return (
    <>
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
