import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { runOnUI } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { VertexComponentRenderData } from '@/types/components';
import { Graph } from '@/types/graphs';
import { AnimatedVectorCoordinates, BoundingRect } from '@/types/layout';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { updateNewVerticesPositions } from '@/utils/forces';
import { placeVertices } from '@/utils/placement';

type ForcesPlacementContextType = {
  lockedVertices: Record<string, boolean>;
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>;
};

const ForcesPlacementContext = createContext(null);

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
  graph: Graph<V, E>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  onRender: (boundingRect: BoundingRect) => void;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphSettingsWithDefaults<V, E>;
}>;

function ForcesPlacementProvider<V, E>({
  children,
  graph,
  layoutAnimationSettings,
  onRender,
  renderedVerticesData,
  settings
}: ForcesPlacementProviderProps<V, E>) {
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
    // Skip the first render (when renderedVerticesData is empty)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      isSecondRenderRef.current = true;
      return;
    }
    // Get animated vertices positions
    const animatedVerticesPositions = Object.fromEntries(
      Object.entries(renderedVerticesData).map(([key, { position }]) => [
        key,
        position
      ])
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
  }, [renderedVerticesData]);

  const handleFirstGraphRender = (
    animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
  ) => {
    isSecondRenderRef.current = false;

    const { boundingRect, verticesPositions } = placeVertices(
      graph.connections,
      settings.components.vertex.radius,
      settings.placement
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
      renderedVerticesData,
      graph.connections,
      settings.components.vertex.radius
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <ForcesPlacementContext.Provider value={contextValue as any}>
      {children}
    </ForcesPlacementContext.Provider>
  );
}

export default withGraphData(
  ForcesPlacementProvider,
  ({ layoutAnimationSettings, renderedVerticesData }) => ({
    layoutAnimationSettings,
    renderedVerticesData
  })
);
