import { Mask } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { FocusContextType } from '@/providers/canvas';
import { AnimatedBoundingRect } from '@/types/layout';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphEdgesMask from './GraphEdgesMask';
import GraphVertices from './GraphVertices';

type GraphComponentProps = {
  boundingRect: AnimatedBoundingRect;
  focusContext: FocusContextType;
};

function GraphComponent({ boundingRect, focusContext }: GraphComponentProps) {
  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(
    focusProgress,
    focusContext.focusTransitionProgress,
    focusContext.focus.key
  );

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
