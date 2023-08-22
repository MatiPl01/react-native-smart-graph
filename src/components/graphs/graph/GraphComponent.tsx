import { memo } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

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

  const testStyle = useAnimatedStyle(() => ({
    height: boundingRect.bottom.value - boundingRect.top.value,
    transform: [
      { translateX: boundingRect.left.value },
      { translateY: boundingRect.top.value }
    ],
    width: boundingRect.right.value - boundingRect.left.value
  }));

  return (
    <>
      {/* TODO - remove after testing */}
      <Animated.View style={testStyle} />
      {/* TODO - implement this */}
      {/* <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges focusProgress={focusProgress} />
      </Mask> */}
      <GraphEdges focusProgress={focusProgress} />
      <GraphVertices focusContext={focusContext} />
      <GraphEdgesLabels focusProgress={focusProgress} />
    </>
  );
}

export default memo(GraphComponent);
