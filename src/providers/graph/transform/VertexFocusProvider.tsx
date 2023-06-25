import { PropsWithChildren, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import { useFocusObserver } from '@/hooks';
import { withGraphData } from '@/providers/graph/data';
import {
  EdgeComponentRenderData,
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { FocusSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import { AnimatedDimensions } from '@/types/layout';
import { updateComponentsFocusFocus } from '@/utils/animations';

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  canvasDimensions: AnimatedDimensions;
  graph: Graph<V, E>;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  setFocus: FocusSetter;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function VertexFocusProvider<V, E>({
  // canvasDimensions,
  children,
  graph,
  renderedEdgesData,
  renderedVerticesData,
  setFocus
}: // verticesData
VertexFocusProviderProps<V, E>) {
  // OBSERVER
  // Vertex focus observer
  const [{ animationSettings, focusedVertexKey }] = useFocusObserver(graph);
  const vertexData =
    (focusedVertexKey && renderedVerticesData[focusedVertexKey]) || null;
  // OTHER VALUES
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);

  useEffect(() => {
    const updatedAnimationSettings =
      animationSettings !== null
        ? {
            ...DEFAULT_FOCUS_ANIMATION_SETTINGS,
            ...animationSettings
          }
        : null;

    if (!vertexData) {
      setFocus(null, updatedAnimationSettings);
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
      updatedAnimationSettings
    );
  }, [vertexData]);

  useAnimatedReaction(
    () =>
      vertexData
        ? {
            scale: vertexData.scale.value,
            x: vertexData.position.x.value,
            y: vertexData.position.y.value
          }
        : null,
    data => {
      if (!data) return;
      // TODO - add some more settings (position relatively to the canvas, etc.)
      focusX.value = data.x;
      focusY.value = data.y;
      focusScale.value = 3;
    }
  );

  useAnimatedReaction(
    () => ({
      vertexKey: focusedVertexKey
    }),
    ({ vertexKey }) => {
      // Update focusProgress of all graph components
      updateComponentsFocusFocus(
        vertexKey ? { vertices: [vertexKey] } : null,
        renderedVerticesData,
        renderedEdgesData
      );
    },
    [focusedVertexKey]
  );

  return <>{children}</>;
}

export default withGraphData(
  VertexFocusProvider,
  ({ renderedEdgesData, renderedVerticesData, verticesData }) => ({
    renderedEdgesData,
    renderedVerticesData,
    verticesData
  })
);
