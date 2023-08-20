import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAnimatedReaction } from 'react-native-reanimated';

import GraphViewChildrenProvider, {
  useGraphViewChildrenContext
} from '@/contexts/GraphViewChildrenProvider';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import CanvasProvider, { useGesturesContext } from '@/providers/view';
import { deepMemoComparator, unsharedify } from '@/utils/objects';
import { GraphViewProps, validateProps } from '@/validations/GraphView';

function GraphView({ children, ...providerProps }: GraphViewProps) {
  const providerComposer = useMemo(() => <GraphViewComposer />, []);

  useAnimatedReaction(
    () => unsharedify(providerProps), // TODO - fix (doesn't work with shared values)
    props => {
      console.log('>>>>>');
      validateProps(props);
    }
  );

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
      {/* Render other components than canvas (e.g. graph controls) */}
      <View style={styles.overlay}>{overlay}</View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none'
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
    shallow: [
      // This is used when the graph component is the only child of the GraphView
      'children.graph',
      // This is used when the GraphView has multiple children (e.g. when
      // GraphViewControls are used)
      'children.*.graph'
    ]
  })
) as typeof GraphView;
