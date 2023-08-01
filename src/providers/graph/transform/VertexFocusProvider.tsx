import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { FocusContextType, FocusStatus } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import { VertexComponentData } from '@/types/components';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { FocusedVertexData } from '@/types/settings/focus';
import {
  getFocusedVertexData,
  getFocusedVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';

type VertexFocusContextType = {
  isVertexFocused: SharedValue<boolean>;
};

const VertexFocusContext = createContext(null as unknown as object);

export const useVertexFocusContext = () => {
  const contextValue = useContext(VertexFocusContext);

  if (!contextValue) {
    throw new Error(
      'useVertexFocusContext must be used within a VertexFocusProvider'
    );
  }

  return contextValue as VertexFocusContextType;
};

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  availableScales: SharedValue<number[]>;
  canvasDimensions: AnimatedDimensions;
  focusContext: FocusContextType;
  graph: Graph<V, E>;
  initialScale: SharedValue<number>;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function VertexFocusProvider<V, E>({
  availableScales,
  canvasDimensions,
  children,
  focusContext,
  graph,
  initialScale,
  vertexRadius,
  verticesData
}: VertexFocusProviderProps<V, E>) {
  // OBSERVER
  // Vertex focus observer
  const [data] = useFocusObserver(graph);

  // FOCUSED VERTEX DATA
  const focusedVertexWithPosition = useMemo(() => {
    const position =
      data.focusedVertexKey && verticesData[data.focusedVertexKey]?.position;
    return position && data.focusedVertexKey
      ? {
          key: data.focusedVertexKey,
          position
        }
      : null;
  }, [verticesData, data.focusedVertexKey]);
  // Updated focused vertex data
  const focusedVertexData = useMemo<FocusedVertexData>(
    () =>
      getFocusedVertexData(
        focusedVertexWithPosition,
        vertexRadius,
        availableScales.value,
        initialScale.value,
        data.settings
      ),
    [focusedVertexWithPosition, data.settings]
  );

  // CONTEXT VALUES
  // Is vertex focused
  const isVertexFocused = useSharedValue(false);

  // OTHER VALUES
  // Helper values
  const isFirstRenderRef = useRef(true);
  const isInitialStatus = useSharedValue(true);
  const transitionDisabled = useSharedValue(false);

  useEffect(() => {
    // Don't do anything on the first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!focusedVertexData.vertex) {
      // End focus if there is no focused vertex and focus is still active
      if (
        focusContext.status.value !== FocusStatus.BLUR &&
        focusContext.status.value !== FocusStatus.BLUR_TRANSITION
      ) {
        focusContext.endFocus(undefined, focusedVertexData.animation);
        isVertexFocused.value = false;
      }
      return;
    }

    // Disable transitions until the new focus animations starts
    transitionDisabled.value = true;
    // Start focus if there is a focused vertex and focus is not active
    if (focusContext.focus.key.value === focusedVertexData.vertex.key) return;
    const {
      position: { x, y },
      scale
    } = focusedVertexData.vertex;
    updateFocusTransformation(
      {
        end: {
          scale,
          x: x.value,
          y: y.value
        }
      },
      focusContext
    );
    focusContext.startFocus(
      {
        gesturesDisabled: data.settings.disableGestures,
        key: focusedVertexData.vertex.key
      },
      focusedVertexData.animation
    );
    isVertexFocused.value = true;
  }, [focusedVertexData]);

  useAnimatedReaction(
    () => focusContext.status.value,
    status => {
      if (
        status === FocusStatus.FOCUS_TRANSITION ||
        status === FocusStatus.BLUR_TRANSITION
      ) {
        transitionDisabled.value = false;
      }
    }
  );

  // Update the focused vertex position and scale on their change
  // if focus is begin focused or is getting focused/blurred
  useAnimatedReaction(
    () => {
      if (!focusedVertexData.vertex) {
        return null;
      }

      const { vertex } = focusedVertexData;
      return {
        alignment: vertex.alignment,
        canvasDimensions: {
          height: canvasDimensions.height.value,
          width: canvasDimensions.width.value
        },
        vertex: {
          radius: vertex.radius,
          scale: vertex.scale,
          x: vertex.position.x.value,
          y: vertex.position.y.value
        }
      };
    },
    vertexData => {
      if (!vertexData) return;
      updateFocusTransformation(
        { end: getFocusedVertexTransformation(vertexData) },
        focusContext
      );
    }
  );

  const blurGraph = () => {
    graph.blur();
  };

  useAnimatedReaction(
    () => focusContext.status.value,
    status => {
      if (isInitialStatus.value) {
        isInitialStatus.value = false;
        return;
      }
      if (
        status === FocusStatus.BLUR_TRANSITION ||
        status === FocusStatus.BLUR
      ) {
        runOnJS(blurGraph)();
        isVertexFocused.value = false;
      }
    }
  );

  const contextValue = useMemo<VertexFocusContextType>(
    () => ({
      isVertexFocused
    }),
    []
  );

  return (
    <VertexFocusContext.Provider value={contextValue}>
      {children}
    </VertexFocusContext.Provider>
  );
}

export default withGraphData(VertexFocusProvider, ({ verticesData }) => ({
  verticesData
}));
