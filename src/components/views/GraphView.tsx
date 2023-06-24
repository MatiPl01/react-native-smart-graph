import React, {
  ForwardedRef,
  forwardRef,
  memo,
  PropsWithChildren,
  useImperativeHandle
} from 'react';
import { StyleSheet, View } from 'react-native';

import ViewControls from '@/components/controls/ViewControls';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import {
  useAutoSizingContext,
  useCanvasDataContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import CanvasProvider from '@/providers/canvas/CanvasProvider';
import { ObjectFit } from '@/types/views';
import { deepMemoComparator } from '@/utils/equality';

import CanvasComponent from './canvas/CanvasComponent';

type GraphViewProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  controls?: boolean;
  initialScale?: number;
  objectFit?: ObjectFit;
  scales?: number[];
}>;

export type GraphViewRef = {
  focus(vertexKey: string): void;
};

function GraphView(
  { children, controls, ...providerProps }: GraphViewProps,
  ref: ForwardedRef<GraphViewRef>
) {
  return (
    <View style={styles.container}>
      <CanvasProvider {...providerProps} isRefProvided={!!ref}>
        <GraphViewComposer controls={controls} forwardedRef={ref}>
          {children}
        </GraphViewComposer>
      </CanvasProvider>
    </View>
  );
}

type GraphViewComposerProps = PropsWithChildren<{
  controls?: boolean;
  forwardedRef: ForwardedRef<GraphViewRef>;
}>;

const GraphViewComposer = ({
  children,
  controls,
  forwardedRef
}: GraphViewComposerProps) => {
  // CONTEXTS
  // Canvas data context
  const { boundingRect, currentScale, currentTranslation } =
    useCanvasDataContext();
  // Transform context
  const { handleCanvasRender, handleGraphRender, resetContainerPosition } =
    useTransformContext();
  // Auto sizing context
  const autoSizingContext = useAutoSizingContext();
  // Gestures context
  const { gestureHandler } = useGesturesContext();

  useImperativeHandle(
    forwardedRef,
    () => ({
      focus: (vertexKey: string) => {
        console.log('focus', vertexKey);
      }
    }),
    []
  );

  const handleReset = () => {
    resetContainerPosition({
      animated: true,
      autoSizing: autoSizingContext
        ? {
            disable: autoSizingContext.disableAutoSizing,
            enableAfterTimeout: autoSizingContext.enableAutoSizingAfterTimeout
          }
        : undefined
    });
  };

  return (
    <>
      <OverlayProvider>
        <CanvasComponent
          graphComponentProps={{
            onRender: handleGraphRender
          }}
          transform={{
            scale: currentScale,
            translateX: currentTranslation.x,
            translateY: currentTranslation.y
          }}
          boundingRect={boundingRect}
          onRender={handleCanvasRender}>
          {children}
        </CanvasComponent>
        {/* Renders overlay layers set using the OverlayContext */}
        <OverlayOutlet gesture={gestureHandler} />
      </OverlayProvider>
      {/* Display graph controls */}
      {controls && <ViewControls onReset={handleReset} />}
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
  forwardRef(GraphView),
  deepMemoComparator({
    // Exclude events callback functions from the comparison
    exclude: ['children.settings.events'],
    // shallow compare the graph object property of the child component
    // to prevent deep checking a large graph model structure
    // (graph should be memoized using the useMemo hook to prevent
    // unnecessary rerenders)
    shallow: ['children.graph']
  })
);
