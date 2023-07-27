import { Mask } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { CanvasDataContextType, FocusContextType } from '@/providers/canvas';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphEdgesMask from './GraphEdgesMask';
import GraphVertices from './GraphVertices';

type GraphComponentProps = {
  canvasDataContext: CanvasDataContextType;
  focusContext: FocusContextType;
};

function GraphComponent({
  canvasDataContext: { boundingRect },
  focusContext: {
    focus: { key: focusKey },
    focusTransitionProgress
  }
}: GraphComponentProps) {
  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusTransitionProgress, focusKey);

  return (
    <>
      <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges focusProgress={focusProgress} />
      </Mask>
      <GraphVertices
        focusKey={focusKey}
        focusTransitionProgress={focusTransitionProgress}
      />
      <GraphEdgesLabels focusProgress={focusProgress} />
    </>
  );
}

export default memo(GraphComponent);
