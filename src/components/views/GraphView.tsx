import React, { memo, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import ViewControls from '@/components/controls/ViewControls';
import {
  AUTO_SIZING_TIMEOUT,
  DEFAULT_SCALES,
  INITIAL_SCALE
} from '@/constants/views';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import ViewProvider from '@/providers/canvas/ViewProvider';
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

function GraphView({
  autoSizingTimeout = AUTO_SIZING_TIMEOUT,
  children,
  controls = false,
  initialScale = INITIAL_SCALE,
  objectFit = 'none',
  scales = DEFAULT_SCALES
}: GraphViewProps) {
  return (
    <View style={styles.container}>
      <OverlayProvider>
        <ViewProvider objectFit={objectFit}>
          <CanvasComponent
            boundingRect={{
              bottom: containerBottom,
              left: containerLeft,
              right: containerRight,
              top: containerTop
            }}
            graphComponentProps={{
              onRender: handleGraphRender
            }}
            transform={{
              scale: currentScale,
              translateX,
              translateY
            }}
            onRender={handleCanvasRender}>
            {children}
          </CanvasComponent>
          {/* Renders overlay layers set using the OverlayContext */}
          <OverlayOutlet gesture={canvasGestureHandler} />
        </ViewProvider>
      </OverlayProvider>
      {controls && (
        <ViewControls
          onReset={() => resetContainerPosition({ animated: true })}
        />
      )}
    </View>
  );
}

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
