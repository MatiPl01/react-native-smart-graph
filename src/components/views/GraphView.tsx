import React, { memo, PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ViewControls from '@/components/controls/ViewControls';
import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import GraphViewChildrenProvider, {
  useGraphViewChildrenContext
} from '@/contexts/GraphViewChildrenProvider';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import CanvasProvider, {
  FocusStatus,
  useAutoSizingContext,
  useCanvasDataContext,
  useFocusContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { deepMemoComparator } from '@/utils/equality';

type GraphViewProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  controls?: boolean;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
}>;

function GraphView({ children, controls, ...providerProps }: GraphViewProps) {
  console.log('GraphView');

  const providerComposer = useMemo(
    () => <GraphViewComposer controls={controls} />,
    [controls] // TODO - improve in https://github.com/MatiPl01/react-native-smart-graph/pull/184
  );

  return (
    <View style={styles.container}>
      <GraphViewChildrenProvider graphViewChildren={children}>
        <CanvasProvider {...providerProps}>{providerComposer}</CanvasProvider>
      </GraphViewChildrenProvider>
    </View>
  );
}

type GraphViewComposerProps = {
  controls?: boolean;
};

const GraphViewComposer = memo(({ controls }: GraphViewComposerProps) => {
  console.log('GraphViewComposer');
  // CONTEXTS
  // Graph view children context
  const { canvas } = useGraphViewChildrenContext();
  // Canvas data context
  const { initialScale } = useCanvasDataContext();
  // Transform context
  const { resetContainerPosition } = useTransformContext();
  // Auto sizing context
  const autoSizingContext = useAutoSizingContext();
  // Gestures context
  const { gestureHandler } = useGesturesContext();
  // Focus context
  const { endFocus, focusStatus } = useFocusContext();

  const handleReset = () => {
    if (focusStatus.value === FocusStatus.BLUR) {
      resetContainerPosition({
        animationSettings: DEFAULT_FOCUS_ANIMATION_SETTINGS,
        autoSizingContext,
        scale: initialScale.value
      });
    } else {
      endFocus(undefined, DEFAULT_FOCUS_ANIMATION_SETTINGS);
    }
  };

  return (
    <>
      <OverlayProvider>
        {canvas}
        {/* Renders overlay layers set using the OverlayContext */}
        <OverlayOutlet gestureHandler={gestureHandler} />
      </OverlayProvider>
      {/* Display graph controls */}
      {controls && <ViewControls onReset={handleReset} />}
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
