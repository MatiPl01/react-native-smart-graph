import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { withGraphData } from '@/providers/graph/data';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { FocusSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { FocusedVertexData } from '@/types/settings/focus';
import { updateComponentsFocus } from '@/utils/animations';
import { getFocusedVertexData } from '@/utils/focus';
import { getAlignedVertexAbsolutePosition } from '@/utils/layout';

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  availableScales: number[];
  canvasDimensions: AnimatedDimensions;
  graph: Graph<V, E>;
  initialScale: number;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  setFocus: FocusSetter;
  vertexRadius: number;
}>;

function VertexFocusProvider<V, E>({
  availableScales,
  canvasDimensions,
  children,
  graph,
  initialScale,
  renderedEdgesData,
  renderedVerticesData,
  setFocus,
  vertexRadius
}: VertexFocusProviderProps<V, E>) {
  // OBSERVER
  // Vertex focus observer
  const [data] = useFocusObserver(graph);
  // Updated focused vertex data
  const focusedVertexData = useMemo<FocusedVertexData>(
    () =>
      getFocusedVertexData(
        data.focusedVertexKey,
        renderedVerticesData,
        vertexRadius,
        availableScales,
        initialScale,
        data.settings
      ),
    [data]
  );

  // OTHER VALUES
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);

  useEffect(() => {
    if (!focusedVertexData.vertex) {
      setFocus(null, focusedVertexData.animation);
      return;
    }
    setFocus(
      {
        centerPosition: {
          x: focusX,
          y: focusY
        },
        scale: focusScale
      },
      focusedVertexData.animation
    );
  }, [focusedVertexData]);

  useAnimatedReaction(
    () => {
      if (!focusedVertexData.vertex) return null;

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
      const { x: dx, y: dy } = getAlignedVertexAbsolutePosition(
        vertexData.canvasDimensions,
        vertexData.alignment,
        vertexData.radius
      );
      focusX.value = vertexData.x + dx;
      focusY.value = vertexData.y + dy;
      focusScale.value = vertexData.scale;
    }
  );

  useAnimatedReaction(
    () => ({
      vertexKey: data.focusedVertexKey
    }),
    ({ vertexKey }) => {
      // Update focusProgress of all graph components
      updateComponentsFocus(
        vertexKey ? { vertices: [vertexKey] } : null,
        renderedVerticesData,
        renderedEdgesData
      );
    },
    [data.focusedVertexKey]
  );

  return <>{children}</>;
}

export default withGraphData(
  VertexFocusProvider,
  ({ renderedEdgesData, renderedVerticesData }) => ({
    renderedEdgesData,
    renderedVerticesData
  })
);
