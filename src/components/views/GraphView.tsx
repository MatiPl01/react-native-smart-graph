import { PropsWithChildren, useMemo } from 'react';
import { View } from 'react-native';

import { DEFAULT_VIEW_SETTINGS } from '@/configs/view';
import GraphViewChildrenProvider from '@/contexts/GraphViewChildrenProvider';
import CanvasProvider from '@/providers/view';
import { GraphViewSettings } from '@/types/settings/public/view';

type GraphViewProps = PropsWithChildren<GraphViewSettings>;

function GraphView({ children, ...providerProps }: GraphViewProps) {
  validateProps(providerProps);
  const providerComposer = useMemo(() => <GraphViewComposer />, []);

  return (
    <View style={styles.container}>
      <GraphViewChildrenProvider graphViewChildren={children}>
        <CanvasProvider {...providerProps}>{providerComposer}</CanvasProvider>
      </GraphViewChildrenProvider>
    </View>
  );
}

const validateProps = ({ initialScale, scales }: GraphViewProps) => {
  // Validate parameters
  if (scales) {
    if (scales.length === 0) {
      throw new Error('At least one scale must be provided');
    }
    if (
      scales.indexOf(initialScale ?? DEFAULT_VIEW_SETTINGS.initialScale) < 0
    ) {
      throw new Error('Initial scale must be included in scales');
    }
    if (scales.some(scale => scale <= 0)) {
      throw new Error('All scales must be positive');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (scales.some((scale, index) => scale <= scales[index - 1]!)) {
      throw new Error('Scales must be in ascending order');
    }
  }
};

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
