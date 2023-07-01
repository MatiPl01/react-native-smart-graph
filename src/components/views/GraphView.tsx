import React, { Children, memo, PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import UndirectedGraphComponent from '@/components/graphs/UndirectedGraphComponent';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import CanvasProvider, {
  useCanvasDataContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { deepMemoComparator } from '@/utils/equality';

import CanvasComponent from './canvas/CanvasComponent';

type GraphViewProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
}>;

function GraphView({ children, ...providerProps }: GraphViewProps) {
  return (
    <View style={styles.container}>
      <CanvasProvider {...providerProps}>
        <GraphViewComposer>{children}</GraphViewComposer>
      </CanvasProvider>
    </View>
  );
}

const CANVAS_COMPONENTS = [DirectedGraphComponent, UndirectedGraphComponent];

type GraphViewComposerProps = { children: React.ReactNode };

const GraphViewComposer = ({ children }: GraphViewComposerProps) => {
  // CONTEXTS
  // Canvas data context
  const { boundingRect, currentScale, currentTranslation } =
    useCanvasDataContext();
  // Transform context
  const { handleCanvasRender } = useTransformContext();
  // Gestures context
  const { gestureHandler } = useGesturesContext();

  const groupedChildren = useMemo(() => {
    // Group components in 2 categories: overlay components and canvas components
    const overlayComponents: Array<React.ReactNode> = [];
    const canvasComponents: Array<React.ReactNode> = [];

    Children.forEach(children, child => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if (CANVAS_COMPONENTS.includes((child as any)?.type)) {
        canvasComponents.push(child);
      } else {
        overlayComponents.push(child);
      }
    });

    return { canvas: canvasComponents, overlay: overlayComponents };
  }, [children]);

  return (
    <>
      <OverlayProvider>
        <CanvasComponent
          transform={{
            scale: currentScale,
            translateX: currentTranslation.x,
            translateY: currentTranslation.y
          }}
          boundingRect={boundingRect}
          onRender={handleCanvasRender}>
          {/* Render canvas components */}
          {groupedChildren.canvas}
        </CanvasComponent>

        {/* Graph overlay layers */}
        <GestureDetector gesture={gestureHandler}>
          <View style={StyleSheet.absoluteFill}>
            {/* Renders overlay layers set using the OverlayContext */}
            <OverlayOutlet />
            {/* Render overlay components */}
            {groupedChildren.overlay}
          </View>
        </GestureDetector>
      </OverlayProvider>
    </>
  );
};

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
    // Exclude events callback functions from the comparison
    exclude: ['children.settings.events'],
    // shallow compare the graph object property of the child component
    // to prevent deep checking a large graph model structure
    // (graph should be memoized using the useMemo hook to prevent
    // unnecessary rerenders)
    shallow: ['children.graph']
  })
) as typeof GraphView;
