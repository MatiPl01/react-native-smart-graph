import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { runOnUI, SharedValue } from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { VertexComponentData } from '@/types/data';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphPlacementSettings
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { updateNewVerticesPositions } from '@/utils/forces';
import { placeVertices } from '@/utils/placement';

type ForcesPlacementContextType = {
  lockedVertices: Record<string, boolean>;
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>;
};

const ForcesPlacementContext = createContext(null as unknown as object);

export const useForcesPlacementContext = () => {
  const contextValue = useContext(ForcesPlacementContext);

  if (!contextValue) {
    throw new Error(
      'useForcesPlacementContext must be used within a ForcesPlacementProvider'
    );
  }

  return contextValue as ForcesPlacementContextType;
};

export type ForcesPlacementProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  layoutAnimationSettings: AllAnimationSettings;
  placementSettings: AllGraphPlacementSettings;
  vertexRadius: SharedValue<number>;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function ForcesPlacementProvider<V, E>({
  children,
  connections,
  layoutAnimationSettings,
  placementSettings,
  vertexRadius,
  verticesData
}: ForcesPlacementProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const {
    transformContext: { handleGraphRender: onRender }
  } = useCanvasContexts();

  // Use separate array with rendered vertices data to ensure that the
  // ForcesLayoutProvider will not try to move vertices that aren't
  // correctly positioned yet (By default vertices are positioned at
  // the center of the graph container resulting in rendering them one
  // on top of another. The resulting forces are then too big and
  // vertices are moved too far away from each other)
  const [placedVerticesPositions, setPlacedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});
  // Set of vertices that should not be moved by the forces
  // (Use record instead of set because set cannot be used with reanimated)
  const [lockedVertices, setLockedVertices] = useState<Record<string, boolean>>(
    {}
  );
  // Ref to track if the component is rendered for the first time
  const isFirstRenderRef = useRef(true);
  // Ref to track if the component is rendered for the second time
  const isSecondRenderRef = useRef(false);

  useEffect(() => {
    // Skip the first render (when verticesData is empty)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      isSecondRenderRef.current = true;
      return;
    }
    // Get animated vertices positions
    const animatedVerticesPositions = Object.fromEntries(
      Object.entries(verticesData).map(([key, { position }]) => [key, position])
    );
    // Animate vertices to their final positions on the second render
    if (isSecondRenderRef.current) {
      handleFirstGraphRender(animatedVerticesPositions);
    }
    // Otherwise, calculate the optimal render positions for the vertices
    // and add them to the state
    else {
      handleNextGraphRender();
    }
    // Update the state
    setPlacedVerticesPositions(animatedVerticesPositions);
  }, [verticesData]);

  const handleFirstGraphRender = (
    animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
  ) => {
    isSecondRenderRef.current = false;

    const { boundingRect, verticesPositions } = placeVertices(
      connections,
      vertexRadius.value,
      placementSettings
    );
    onRender(boundingRect);

    animateVerticesToFinalPositions(
      animatedVerticesPositions,
      verticesPositions,
      {
        ...layoutAnimationSettings,
        onComplete: createFirstAnimationCompleteHandler(
          layoutAnimationSettings.onComplete
        )
      }
    );

    // Mark vertices as locked until the animation is complete
    setLockedVertices(
      Object.fromEntries(
        Object.keys(animatedVerticesPositions).map(key => [key, true])
      )
    );
  };

  const handleNextGraphRender = () => {
    runOnUI(updateNewVerticesPositions)(
      placedVerticesPositions,
      verticesData,
      connections,
      vertexRadius.value
    );
  };

  const createFirstAnimationCompleteHandler =
    (onComplete?: () => void) => () => {
      // Unlock vertices
      setLockedVertices({});
      // Call the original onComplete handler
      onComplete?.();
    };

  const contextValue = useMemo<ForcesPlacementContextType>(
    () => ({
      lockedVertices,
      placedVerticesPositions
    }),
    [placedVerticesPositions, lockedVertices]
  );

  return (
    <ForcesPlacementContext.Provider value={contextValue}>
      {children}
    </ForcesPlacementContext.Provider>
  );
}

export default withGraphSettings(
  withComponentsData(
    ForcesPlacementProvider,
    ({ connections, layoutAnimationSettings, verticesData }) => ({
      connections,
      layoutAnimationSettings,
      verticesData
    })
  ),
  ({ settings }) => ({
    placementSettings: settings.placement,
    vertexRadius: settings.components.vertex.radius
  })
);
