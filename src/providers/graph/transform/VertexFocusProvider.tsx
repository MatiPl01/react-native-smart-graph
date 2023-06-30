import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { FocusStatus } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { FocusEndSetter, FocusStartSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { FocusedVertexData } from '@/types/settings/focus';
import { getFocusedVertexData } from '@/utils/focus';
import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from '@/utils/layout';

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  availableScales: number[];
  canvasDimensions: AnimatedDimensions;
  endFocus: FocusEndSetter;
  focusStatus: SharedValue<number>;
  graph: Graph<V, E>;
  initialScale: number;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
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
  graph,
  initialScale,
  renderedEdgesData,
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

  const isFirstRenderRef = useRef(true);
  // const previousFocusedVertexKey = useRef<null | string>(null);

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
        // previousFocusedVertexKey.current = null;
        endFocus(undefined, focusedVertexData.animation);
      }
      return;
    }
    // previousFocusedVertexKey.current = data.focusedVertexKey;

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

  // Update the focused vertex position and scale on their change
  // if focus is begin focused or is getting focused/blurred
  useAnimatedReaction(
    () => {
      if (
        !focusedVertexData.vertex ||
        ![
          FocusStatus.FOCUS_TRANSITION,
          FocusStatus.FOCUS,
          FocusStatus.BLUR_TRANSITION
        ].some(status => status === focusStatus.value)
      ) {
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

  // const blurGraph = () => {
  //   graph.blur();
  // };

  // useAnimatedReaction(
  //   () => ({
  //     status: focusStatus.value,
  //     vertexKey: data.focusedVertexKey
  //   }),
  //   ({ status, vertexKey }) => {
  //     if (status === 0) {
  //       runOnJS(blurGraph)();
  //       return;
  //     }
  //     // Update focusProgress of all graph components
  //     updateComponentsFocus(
  //       vertexKey && status === 1 ? { vertices: [vertexKey] } : null,
  //       renderedVerticesData,
  //       renderedEdgesData
  //     );
  //   },
  //   [
  //     focusStatus,
  //     data.focusedVertexKey,
  //     renderedVerticesData,
  //     renderedEdgesData
  //   ]
  // );

  return <>{children}</>;
}

export default withGraphData(
  VertexFocusProvider,
  ({ renderedEdgesData, renderedVerticesData }) => ({
    renderedEdgesData,
    renderedVerticesData
  })
);
