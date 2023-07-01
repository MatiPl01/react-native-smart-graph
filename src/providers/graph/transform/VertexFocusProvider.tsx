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

type VertexFocusContextType = {
  focusTransitionProgress: SharedValue<number>;
  focusedVertexKey: SharedValue<null | string>;
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
  availableScales: number[];
  canvasDimensions: AnimatedDimensions;
  endFocus: FocusEndSetter;
  focusStatus: SharedValue<number>;
  focusTransitionProgress: SharedValue<number>;
  graph: Graph<V, E>;
  initialScale: number;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  startFocus: FocusStartSetter;
  vertexRadius: number;
}>;

function VertexFocusProvider<V, E>({
  availableScales,
  canvasDimensions,
  children,
  endFocus,
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
  const focusedVertexPosition = useMemo(
    () =>
      (data.focusedVertexKey &&
        renderedVerticesData[data.focusedVertexKey]?.position) ||
      null,
    [renderedVerticesData, data.focusedVertexKey]
  );
  // Updated focused vertex data
  const focusedVertexData = useMemo<FocusedVertexData>(
    () =>
      getFocusedVertexData(
        focusedVertexPosition,
        vertexRadius,
        availableScales,
        initialScale,
        data.settings
      ),
    [focusedVertexPosition, data.settings]
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

  // CONTEXT VALUE
  const focusedVertexKey = useSharedValue<null | string>(null);

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
        focusedVertexKey.value = null;
        runOnJS(blurGraph)();
      } else {
        focusedVertexKey.value = data.focusedVertexKey;
      }
    }
  );

  // useAnimatedReaction(
  //   () => focusedVertexKey.value,
  //   key => {
  //     // TODO - change this in a separate PR
  //   }
  // );

  const contextValue = useMemo<VertexFocusContextType>(
    () => ({
      focusTransitionProgress,
      focusedVertexKey
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
