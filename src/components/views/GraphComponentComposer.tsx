import { Canvas, Group } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { GraphComponent } from '@/components/graphs';
import { DirectedGraphComponentProps } from '@/components/graphs/DirectedGraphComponent';
import { UndirectedGraphComponentProps } from '@/components/graphs/UndirectedGraphComponent';
import {
  useCanvasDataContext,
  useFocusContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import GraphProvider from '@/providers/graph/GraphProvider';

function GraphComponentComposer<
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(props: P) {
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
  // Transform context
  const { handleCanvasRender, handleGraphRender } = useTransformContext();
  // Focus context
  const {
    endFocus,
    focusKey,
    focusStatus,
    focusTransitionProgress,
    startFocus
  } = useFocusContext();
  // Gesture context
  const gesturesContext = useGesturesContext();

  const transform = useMemo(
    () => ({
      scale: currentScale,
      translateX: currentTranslation.x,
      translateY: currentTranslation.y
    }),
    []
  );

  const canvasTransform = useDerivedValue(() => [
    { translateX: currentTranslation.x.value },
    { translateY: currentTranslation.y.value },
    { scale: currentScale.value }
  ]);

  return (
    <Canvas onLayout={handleCanvasRender} style={styles.canvas}>
      <Group transform={canvasTransform}>
        <GraphProvider<V, E>
          {...props}
          boundingRect={boundingRect}
          canvasDimensions={canvasDimensions}
          canvasScales={scales}
          endFocus={endFocus}
          focusKey={focusKey}
          focusStatus={focusStatus}
          focusTransitionProgress={focusTransitionProgress}
          gesturesContext={gesturesContext}
          initialCanvasScale={initialScale}
          onRender={handleGraphRender}
          startFocus={startFocus}
          transform={transform}>
          <GraphComponent boundingRect={boundingRect} />
        </GraphProvider>
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1
  }
});

export default memo(GraphComponentComposer) as <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  props: P
) => JSX.Element;
