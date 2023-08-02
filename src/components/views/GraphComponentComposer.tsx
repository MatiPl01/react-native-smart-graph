import { Canvas, Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { GraphComponent } from '@/components/graphs';
import { DirectedGraphComponentProps } from '@/components/graphs/DirectedGraphComponent';
import { UndirectedGraphComponentProps } from '@/components/graphs/UndirectedGraphComponent';
import {
  AccessibleOverlayContextType,
  withOverlay
} from '@/contexts/OverlayProvider';
import {
  useAutoSizingContext,
  useCanvasDataContext,
  useFocusContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import { CanvasContexts } from '@/providers/graph/contexts';
import GraphProvider from '@/providers/graph/GraphProvider';

const validateProps = <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  props: P
) => {
  // TODO - add more validations
  // FOCUS
  // Focus points validation
  if (props.settings?.focus) {
    const focusPoints = props.settings.focus.points;
    const keySet = new Set();
    Object.keys(focusPoints).forEach(key => {
      if (+key < 0 || +key > 1) {
        throw new Error(
          `Invalid focus points: key ${key} must be between 0 and 1`
        );
      }
      if (keySet.has(key)) {
        throw new Error(
          `Invalid focus points: duplicate key ${key} found in ${JSON.stringify(
            focusPoints
          )}`
        );
      }
      keySet.add(key);
    });
  }
};

function GraphComponentComposer<
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>({
  removeLayer,
  renderLayer,
  ...restProps
}: P & AccessibleOverlayContextType) {
  const props = restProps as unknown as P;
  validateProps<V, E, P>(props);
  // CONTEXTS
  const dataContext = useCanvasDataContext();
  const transformContext = useTransformContext();
  const autoSizingContext = useAutoSizingContext();
  const focusContext = useFocusContext();
  const gesturesContext = useGesturesContext();

  const canvasTransform = useDerivedValue(() => [
    { translateX: dataContext.currentTranslation.x.value },
    { translateY: dataContext.currentTranslation.y.value },
    { scale: dataContext.currentScale.value }
  ]);

  const canvasContexts = useMemo<CanvasContexts>(
    () => ({
      autoSizingContext,
      dataContext,
      focusContext,
      gesturesContext,
      overlayContext: {
        removeLayer,
        renderLayer
      },
      transformContext
    }),
    []
  );

  return (
    <Canvas
      onLayout={transformContext.handleCanvasRender}
      style={styles.canvas}>
      <Group transform={canvasTransform}>
        <GraphProvider<V, E> {...props} canvasContexts={canvasContexts}>
          <GraphComponent />
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

export default withOverlay(GraphComponentComposer) as <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  props: P
) => JSX.Element;
