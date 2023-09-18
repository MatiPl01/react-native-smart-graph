import { Mask } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { useEdgesMaskContext } from '@/providers/graph/appearance';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { useMultiStepFocusContext } from '@/providers/graph/focus';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphVertices from './GraphVertices';

function GraphComponent() {
  // CONTEXTS
  // Canvas contexts
  const { focusContext } = useCanvasContexts();
  // Graph contexts
  const multiStepFocusContext = useMultiStepFocusContext();
  const edgesMaskContext = useEdgesMaskContext();

  // A helper value to animate components on vertex focus
  const focusProgress = useSharedValue(0);
  // Update the focusProgress
  useComponentFocus(focusProgress, focusContext);

  return (
    <>
      {/* Graph edges */}
      {edgesMaskContext ? (
        <Mask mask={edgesMaskContext.maskComponent} mode='luminance'>
          <GraphEdges focusProgress={focusProgress} />
        </Mask>
      ) : (
        <GraphEdges focusProgress={focusProgress} />
      )}
      {/* Graph vertices */}
      <GraphVertices
        focusContext={focusContext}
        multiStepFocusContext={multiStepFocusContext}
      />
      {/* Edges labels */}
      <GraphEdgesLabels focusProgress={focusProgress} />
      {/* TODO - Vertices labels */}
    </>
  );
}

export default memo(GraphComponent);
