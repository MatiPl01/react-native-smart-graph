import { useMemo } from 'react';

import { withOverlay } from '@/contexts/OverlayProvider';
import {
  useCanvasDataContext,
  useFocusContext,
  useTransformContext
} from '@/providers/canvas';
import GraphProvider from '@/providers/graph/GraphProvider';

import { DirectedGraphComponentProps } from './DirectedGraphComponent';
import GraphComponent from './graph/GraphComponent';
import { UndirectedGraphComponentProps } from './UndirectedGraphComponent';

type GraphComponentComposerPrivateProps = {
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
};

function GraphComponentComposer<
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(props: P & GraphComponentComposerPrivateProps) {
  // CONTEXTS
  // Canvas data context
  const {
    boundingRect,
    canvasDimensions,
    currentScale,
    currentTranslation,
    initialScale,
    scales
  } = useCanvasDataContext();
  return null;
  // Transform context
  const { handleGraphRender } = useTransformContext();
  // Focus context
  const {
    endFocus,
    focusKey,
    focusStatus,
    focusTransitionProgress,
    startFocus
  } = useFocusContext();

  const transform = useMemo(
    () => ({
      scale: currentScale,
      translateX: currentTranslation.x,
      translateY: currentTranslation.y
    }),
    []
  );

  return (
    // TODO - fix types
    <GraphProvider<V, E, P>
      {...props}
      boundingRect={boundingRect}
      canvasDimensions={canvasDimensions}
      canvasScales={scales}
      endFocus={endFocus}
      focusKey={focusKey}
      focusStatus={focusStatus}
      focusTransitionProgress={focusTransitionProgress}
      initialCanvasScale={initialScale}
      onRender={handleGraphRender}
      startFocus={startFocus}
      transform={transform}>
      <GraphComponent boundingRect={boundingRect} />
    </GraphProvider>
  );
}

export default withOverlay(GraphComponentComposer) as <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  props: P
) => JSX.Element;
