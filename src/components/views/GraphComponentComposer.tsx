import { Canvas, Group } from '@shopify/react-native-skia';
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
  useCanvasDataContext,
  useFocusContext,
  useGesturesContext,
  useTransformContext
} from '@/providers/canvas';
import GraphProvider from '@/providers/graph/GraphProvider';

const validateProps = <
  V,
  E,
  P extends
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>
>(
  props: P & AccessibleOverlayContextType
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
>(props: P & AccessibleOverlayContextType) {
  validateProps<V, E, P>(props);
  // CONTEXTS
  // Canvas data context
  const canvasDataContext = useCanvasDataContext();
  // Transform context
  const transformContext = useTransformContext();
  // Gestures context
  const gesturesContext = useGesturesContext();
  // Focus context
  const focusContext = useFocusContext();

  const canvasTransform = useDerivedValue(() => [
    { translateX: canvasDataContext.currentTranslation.x.value },
    { translateY: canvasDataContext.currentTranslation.y.value },
    { scale: canvasDataContext.currentScale.value }
  ]);

  return (
    <Canvas
      onLayout={transformContext.handleCanvasRender}
      style={styles.canvas}>
      <Group transform={canvasTransform}>
        <GraphProvider<V, E>
          {...props}
          canvasDataContext={canvasDataContext}
          focusContext={focusContext}
          gesturesContext={gesturesContext}
          transformContext={transformContext}>
          <GraphComponent
            canvasDataContext={canvasDataContext}
            focusContext={focusContext}
          />
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
