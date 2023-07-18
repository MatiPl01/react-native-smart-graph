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
import { FocusStatus } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import { VertexComponentRenderData } from '@/types/components';
import { FocusEndSetter, FocusStartSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { FocusedVertexData } from '@/types/settings/focus';
import { getFocusedVertexData } from '@/utils/focus';
import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from '@/utils/layout';

export type VertexFocusContextType = {
  focusKey: SharedValue<null | string>;
  focusTransitionProgress: SharedValue<number>;
};

const VertexFocusContext = createContext(null);

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
  endFocus: FocusEndSetter;
  focusKey: SharedValue<null | string>;
  focusStatus: SharedValue<number>;
  focusTransitionProgress: SharedValue<number>;
  graph: Graph<V, E>;
  initialScale: SharedValue<number>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  startFocus: FocusStartSetter;
  vertexRadius: number;
}>;

function VertexFocusProvider<V, E>({
  availableScales,
  canvasDimensions,
  children,
  endFocus,
  focusKey,
  focusStatus,
  focusTransitionProgress,
  graph,
  initialScale,
  renderedVerticesData,
  startFocus,
  vertexRadius
}: VertexFocusProviderProps<V, E>) {
  // OBSERVER
  // Vertex focus observer
  const [data] = useFocusObserver(graph);

  // FOCUSED VERTEX DATA
  const focusedVertexWithPosition = useMemo(() => {
    const position =
      data.focusedVertexKey &&
      renderedVerticesData[data.focusedVertexKey]?.position;
    return position && data.focusedVertexKey
      ? {
          key: data.focusedVertexKey,
          position
        }
      : null;
  }, [renderedVerticesData, data.focusedVertexKey]);
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

  // OTHER VALUES
  // Animated focus position and scale
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);
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
        focusStatus.value !== FocusStatus.BLUR &&
        focusStatus.value !== FocusStatus.BLUR_TRANSITION
      ) {
        endFocus(undefined, focusedVertexData.animation);
      }
      return;
    }

    // Disable transitions until the new focus animations starts
    transitionDisabled.value = true;
    // Start focus if there is a focused vertex and focus is not active
    startFocus(
      {
        centerPosition: {
          x: focusX,
          y: focusY
        },
        gesturesDisabled: data.settings.disableGestures,
        key: focusedVertexData.vertex.key,
        scale: focusScale
      },
      focusedVertexData.animation
    );
  }, [focusedVertexData]);

  useAnimatedReaction(
    () => focusStatus.value,
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
      if (!focusedVertexData.vertex || transitionDisabled.value) {
        return null;
      }

      const { vertex } = focusedVertexData;
      return {
        alignment: vertex.alignment,
        canvasDimensions: {
          height: canvasDimensions.height.value,
          width: canvasDimensions.width.value
        },
        radius: vertex.radius,
        scale: vertex.scale,
        x: vertex.position.x.value,
        y: vertex.position.y.value
      };
    },
    vertexData => {
      if (!vertexData) return;
      // Calculate vertex position based on the alignment settings
      const { x: dx, y: dy } = getCoordinatesRelativeToCenter(
        vertexData.canvasDimensions,
        getAlignedVertexAbsolutePosition(
          vertexData.canvasDimensions,
          vertexData.alignment,
          vertexData.radius * vertexData.scale
        )
      );
      focusX.value = vertexData.x - dx / vertexData.scale;
      focusY.value = vertexData.y - dy / vertexData.scale;
      focusScale.value = vertexData.scale;
    }
  );

  const blurGraph = () => {
    graph.blur();
  };

  useAnimatedReaction(
    () => focusStatus.value,
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
      }
    }
  );

  const contextValue = useMemo<VertexFocusContextType>(
    () => ({
      focusKey,
      focusTransitionProgress
    }),
    []
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <VertexFocusContext.Provider value={contextValue as any}>
      {children}
    </VertexFocusContext.Provider>
  );
}

export default withGraphData(
  VertexFocusProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);
