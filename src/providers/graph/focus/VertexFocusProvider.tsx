import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useFocusObserver } from '@/hooks';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import {
  FocusStatus,
  useFocusContext,
  useViewDataContext
} from '@/providers/view';
import { VertexComponentData } from '@/types/data';
import { Graph } from '@/types/models';
import { useNullableContext } from '@/utils/contexts';
import {
  getFocusedVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { getVertexTransformation } from '@/utils/transform';

type VertexFocusContextType = {
  isVertexFocused: SharedValue<boolean>;
};

const VertexFocusContext = createContext<VertexFocusContextType | null>(null);
VertexFocusContext.displayName = 'VertexFocusContext';

export const useVertexFocusContext = () =>
  useNullableContext(VertexFocusContext);

type VertexFocusProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function VertexFocusProvider<V, E>({
  children,
  graph,
  vertexRadius,
  verticesData
}: VertexFocusProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const { canvasDimensions } = useViewDataContext();
  const focusContext = useFocusContext();

  // OBSERVER
  // Vertex focus observer
  const [data] = useFocusObserver(graph);

  // HELPER VALUES
  const focusStatus = focusContext.status;
  const focusedVertex = useMemo(() => {
    const key = data.focusedVertexKey;
    if (!key || !verticesData[key]) {
      return null;
    }
    return verticesData[key];
  }, [data.focusedVertexKey]);

  // CONTEXT VALUES
  // Is vertex focused
  const isVertexFocused = useSharedValue(false);

  // OTHER VALUES
  // Helper values
  const isInitialStatus = useSharedValue(true);
  const transitionDisabled = useSharedValue(false);

  useEffect(() => {
    if (!focusedVertex) {
      const status = focusContext.status.value;
      // End focus if there is no focused vertex and focus is still active
      if (
        status !== FocusStatus.BLUR &&
        status !== FocusStatus.BLUR_TRANSITION
      ) {
        focusContext.endFocus(undefined, data.settings.animation);
        isVertexFocused.value = false;
      }
      return;
    }

    // Disable transitions until the new focus animation starts
    transitionDisabled.value = true;
    // Start focus if there is a focused vertex and focus is not active
    if (focusContext.focus.key.value === focusedVertex.key) return;
    const vertexTransform = getFocusedVertexTransformation(
      data.settings.alignment,
      {
        height: canvasDimensions.height.value,
        width: canvasDimensions.width.value
      },
      getVertexTransformation(focusedVertex, data.settings.vertexScale),
      vertexRadius
    );
    updateFocusTransformation({ end: vertexTransform }, focusContext);
    focusContext.startFocus(
      {
        gesturesDisabled: data.settings.disableGestures,
        key: focusedVertex.key
      },
      data.settings.animation
    );
    isVertexFocused.value = true;
  }, [focusedVertex]);

  useAnimatedReaction(
    () =>
      focusedVertex && {
        canvasDimensions: {
          height: canvasDimensions.height.value,
          width: canvasDimensions.width.value
        },
        transform: getVertexTransformation(
          focusedVertex,
          data.settings.vertexScale
        )
      },
    props => {
      if (!props) return;
      updateFocusTransformation(
        {
          end: getFocusedVertexTransformation(
            data.settings.alignment,
            props.canvasDimensions,
            props.transform,
            vertexRadius
          )
        },
        focusContext
      );
    },
    [focusedVertex]
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
  ({ componentsSettings, graph }) => ({
    graph,
    vertexRadius: componentsSettings.vertex.radius
  })
);
