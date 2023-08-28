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
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { FocusStatus } from '@/providers/view';
import { FocusedVertexData, VertexComponentData } from '@/types/data';
import { Graph } from '@/types/models';
import {
  getFocusedVertexData,
  getFocusedVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { getVertexPosition } from '@/utils/transform';

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
  graph: Graph<V, E>;
  vertexRadius: number;
  vertexScale: SharedValue<number>;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function VertexFocusProvider<V, E>({
  children,
  graph,
  vertexRadius,
  vertexScale: userScale,
  verticesData
}: VertexFocusProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { canvasDimensions },
    focusContext
  } = useCanvasContexts();

  // OBSERVER
  // Vertex focus observer
  const [data] = useFocusObserver(graph);

  // Helper values
  const focusPosition = useDerivedValue(() => {
    // TODO - fix
    console.log('focusPosition');
    const key = data.focusedVertexKey;
    if (!key || !verticesData[key]) {
      return { x: 0, y: 0 };
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return getVertexPosition(verticesData[key]!);
  }, [data.focusedVertexKey]);

  // FOCUSED VERTEX DATA
  const focusedVertexWithPosition = useMemo(() => {
    const vertexData = data.focusedVertexKey
      ? verticesData[data.focusedVertexKey]
      : null;
    return vertexData && !vertexData.removed && data.focusedVertexKey
      ? {
          key: data.focusedVertexKey,
          position: focusPosition
        }
      : null;
  }, [verticesData, data.focusedVertexKey]);
  // Updated focused vertex data
  const focusedVertexData = useMemo<FocusedVertexData>(
    () =>
      getFocusedVertexData(
        focusedVertexWithPosition,
        vertexRadius,
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
    const { scale } = focusedVertexData.vertex;
    updateFocusTransformation(
      {
        end: {
          scale: scale * userScale.value,
          x: focusPosition.value.x,
          y: focusPosition.value.y
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
          scale: vertex.scale / userScale.value,
          x: focusPosition.value.x,
          y: focusPosition.value.y
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

export default withGraphSettings(
  withComponentsData(VertexFocusProvider, ({ verticesData }) => ({
    verticesData
  })),
  ({ graph, settings }) => ({
    graph,
    vertexRadius: settings.components.vertex.radius,
    vertexScale: settings.components.vertex.scale
  })
);
