import { useMemo } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

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
    for (const key in focusPoints) {
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
    }
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
  // Data context
  const dataContext = useViewDataContext();
  const {
    boundingRect,
    currentScale,
    currentTranslation: { x: translateX, y: translateY }
  } = dataContext;
  // Transform context
  const transformContext = useTransformContext();
  // Auto sizing context
  const autoSizingContext = useAutoSizingContext();
  // Focus context
  const focusContext = useFocusContext();
  // Gestures context
  const gesturesContext = useGesturesContext();

  const animatedTransform = useMemo(
    () => ({
      scale: dataContext.currentScale,
      translateX: dataContext.currentTranslation.x,
      translateY: dataContext.currentTranslation.y
    }),
    []
  );

  // IMPORTANT: canvasContexts must be memoized to prevent re-rendering
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

  // IMPORTANT: graphComponent must be memoized to prevent re-rendering
  const graphComponent = useMemo(() => <GraphComponent />, []);

  // TODO - remove overlay layer where the same code is repeated
  // and move press logic to vertices
  const canvasStyle = useAnimatedStyle(() => {
    const width = boundingRect.right.value - boundingRect.left.value;
    const height = boundingRect.bottom.value - boundingRect.top.value;
    const scale = currentScale.value;

    // Translation between the center of the container and the
    // center of the graph
    const dx = (width / 2) * (scale - 1);
    const dy = (height / 2) * (scale - 1);

    return {
      height,
      transform: [
        { translateX: translateX.value + dx },
        { translateY: translateY.value + dy },
        { scale }
      ] as Array<never>, // this is a fix for incorrectly inferred types
      width
    };
  });

  return (
    <Animated.View style={canvasStyle}>
      <GraphProvider
        canvasContexts={canvasContexts}
        graphProps={graphProps}
        transform={animatedTransform}>
        {graphComponent}
      </GraphProvider>
    </Animated.View>
  );
}

export default withOverlay(GraphComponentComposer) as <V, E>(
  props: GraphData<V, E>
) => JSX.Element;
