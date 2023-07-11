import React, { memo, PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import GraphViewChildrenProvider, {
  useGraphViewChildrenContext
} from '@/contexts/GraphViewChildrenProvider';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import CanvasProvider, { useGesturesContext } from '@/providers/canvas';
import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { deepMemoComparator } from '@/utils/equality';

type GraphViewProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
}>;

function GraphView({ children, ...providerProps }: GraphViewProps) {
  const providerComposer = useMemo(() => <GraphViewComposer />, []);

  return (
    <View style={styles.container}>
      <GraphViewChildrenProvider graphViewChildren={children}>
        <CanvasProvider {...providerProps}>{providerComposer}</CanvasProvider>
      </GraphViewChildrenProvider>
    </View>
  );
}

const GraphViewComposer = memo(function () {
  // CONTEXTS
  // Graph view children context
  const { canvas, overlay } = useGraphViewChildrenContext();
  // Gestures context
  const { gestureHandler } = useGesturesContext();

  console.log('GraphViewComposer');

  const overlayOutlet = useMemo(
    () => <OverlayOutlet gestureHandler={gestureHandler} />,
    [gestureHandler]
  );

  return (
    <>
      <OverlayProvider>
        {canvas}
        {/* Renders overlay layers set using the OverlayContext */}
        {overlayOutlet}
      </OverlayProvider>
      {/* Render other component than canvas (e.g. graph controls) */}
      <View style={StyleSheet.absoluteFill}>{overlay}</View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  }
});

// Rerender only on prop changes
export default memo(
  GraphView,
  deepMemoComparator({
    // shallow compare the graph object property of the child component
    // to prevent deep checking a large graph model structure
    // (graph should be memoized using the useMemo hook to prevent
    // unnecessary rerenders)
    shallow: ['children.graph']
  })
) as typeof GraphView;
