import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { FocusContextType, FocusStatus } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import { VertexComponentRenderData } from '@/types/components';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { FocusedVertexData } from '@/types/settings/focus';
import { getFocusedVertexData } from '@/utils/focus';
import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from '@/utils/layout';

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  availableScales: SharedValue<number[]>;
  canvasDimensions: AnimatedDimensions;
  focusContext: FocusContextType;
  graph: Graph<V, E>;
  initialScale: SharedValue<number>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  vertexRadius: number;
}>;

function VertexFocusProvider<V, E>({
  availableScales,
  canvasDimensions,
  children,
  focusContext,
  graph,
  initialScale,
  renderedVerticesData,
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
      }
      return;
    }

    // Disable transitions until the new focus animations starts
    transitionDisabled.value = true;
    // Start focus if there is a focused vertex and focus is not active
    const {
      position: { x, y },
      scale
    } = focusedVertexData.vertex;
    focusContext.focus.x.value = x.value;
    focusContext.focus.y.value = y.value;
    focusContext.focus.scale.value = scale;
    focusContext.startFocus(
      {
        gesturesDisabled: data.settings.disableGestures,
        key: focusedVertexData.vertex.key
      },
      focusedVertexData.animation
    );
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
      focusContext.focus.x.value = vertexData.x - dx / vertexData.scale;
      focusContext.focus.y.value = vertexData.y - dy / vertexData.scale;
      focusContext.focus.scale.value = vertexData.scale;
      console.log(
        focusContext.focus.x.value,
        focusContext.focus.y.value,
        focusContext.focus.scale.value
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
      }
    }
  );

  return <>{children}</>;
}

export default withGraphData(
  VertexFocusProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);
