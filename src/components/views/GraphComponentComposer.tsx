import { Canvas, Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { GraphComponent } from '@/components/graphs';
import {
  AccessibleOverlayContextType,
  withOverlay
} from '@/contexts/OverlayProvider';
import { CanvasContexts, GraphProvider } from '@/providers/graph';
import {
  useAutoSizingContext,
  useFocusContext,
  useGesturesContext,
  useTransformContext,
  useViewDataContext
} from '@/providers/view';
import { GraphData } from '@/types/data';

const validateProps = <V, E>(props: GraphData<V, E>) => {
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

function GraphComponentComposer<V, E>({
  removeLayer,
  renderLayer,
  ...restProps
}: GraphData<V, E> & AccessibleOverlayContextType) {
  const graphProps = restProps;
  validateProps<V, E>(graphProps);
  // CONTEXTS
  const dataContext = useViewDataContext();
  const transformContext = useTransformContext();
  const autoSizingContext = useAutoSizingContext();
  const focusContext = useFocusContext();
  const gesturesContext = useGesturesContext();

  const canvasTransform = useDerivedValue(() => [
    { translateX: dataContext.currentTranslation.x.value },
    { translateY: dataContext.currentTranslation.y.value },
    { scale: dataContext.currentScale.value }
  ]);

  const animatedTransform = useMemo(
    () => ({
      scale: dataContext.currentScale,
      translateX: dataContext.currentTranslation.x,
      translateY: dataContext.currentTranslation.y
    }),
    []
  );

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

  console.log(graphProps.settings?.components);

  return (
    <Canvas
      onLayout={transformContext.handleCanvasRender}
      style={styles.canvas}>
      <Group transform={canvasTransform}>
        <GraphProvider
          canvasContexts={canvasContexts}
          graphProps={graphProps}
          transform={animatedTransform}>
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

export default withOverlay(GraphComponentComposer) as <V, E>(
  props: GraphData<V, E>
) => JSX.Element;
