import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { runOnUI, SharedValue, useSharedValue } from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { useTransformContext, useViewDataContext } from '@/providers/view';
import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  InternalGraphPlacementSettings
} from '@/types/settings';
import { useNullableContext } from '@/utils/contexts';
import { updateInitialPlacement, updateNextPlacement } from '@/utils/forces';
import { unsharedify } from '@/utils/objects';
import { udateEdgesOrdering } from '@/utils/transform';

type ForcesPlacementContextType<V> = {
  initialPlacementCompleted: SharedValue<boolean>;
  lockedVertices: Record<string, boolean>;
  placedVerticesData: Record<string, VertexComponentData<V>>;
};

const ForcesPlacementContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createContext<ForcesPlacementContextType<any> | null>(null);
ForcesPlacementContext.displayName = 'ForcesPlacementContext';

export const useForcesPlacementContext = () =>
  useNullableContext(ForcesPlacementContext);

export type ForcesPlacementProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E>>;
  layoutAnimationSettings: AllAnimationSettings;
  placementSettings: InternalGraphPlacementSettings;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function ForcesPlacementProvider<V, E>({
  children,
  connections,
  edgesData,
  layoutAnimationSettings,
  placementSettings,
  vertexRadius,
  verticesData
}: ForcesPlacementProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const { canvasDimensions } = useViewDataContext();
  const { handleGraphRender: onRender } = useTransformContext();

  // Use separate array with rendered vertices data to ensure that the
  // ForcesLayoutProvider will not try to move vertices that aren't
  // correctly positioned yet (By default vertices are positioned at
  // the center of the graph container resulting in rendering them one
  // on top of another. The resulting forces are then too big and
  // vertices are moved too far away from each other)
  const [placedVerticesData, setPlacedVerticesData] = useState<
    Record<string, VertexComponentData<V>>
  >({});
  // Set of vertices that should not be moved by the forces
  // (Use record instead of set because set cannot be used with reanimated)
  const [lockedVertices, setLockedVertices] = useState<Record<string, boolean>>(
    {}
  );
  // Ref to track if the component is rendered for the first time
  const isFirstRenderRef = useRef(true);
  // Used to indicate if the initial placement animation was completed
  const initialPlacementCompleted = useSharedValue(false);

  useEffect(() => {
    // If it's the first render, place vertices in the same way
    // as in the placement strategy
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      handleFirstGraphRender();
    }
    // Otherwise, calculate the optimal render positions for the vertices
    // and add them to the state
    else {
      handleNextGraphRender();
    }
    // Update the state
    setPlacedVerticesData(verticesData);
  }, [verticesData]);

  useEffect(() => {
    udateEdgesOrdering(edgesData, layoutAnimationSettings);
  }, [edgesData]);

  const handleFirstGraphRender = () => {
    runOnUI(updateInitialPlacement)(
      verticesData,
      edgesData,
      connections,
      {
        height: canvasDimensions.height.value,
        width: canvasDimensions.width.value
      },
      unsharedify(placementSettings),
      {
        ...layoutAnimationSettings,
        onComplete: createFirstAnimationCompleteHandler(
          layoutAnimationSettings.onComplete
        )
      },
      onRender
    );

    // Mark vertices as locked until the animation is complete
    setLockedVertices(
      Object.fromEntries(Object.keys(verticesData).map(key => [key, true]))
    );
  };

  const handleNextGraphRender = () => {
    runOnUI(updateNextPlacement)(
      placedVerticesData,
      verticesData,
      edgesData,
      connections,
      vertexRadius
    );
  };

  const createFirstAnimationCompleteHandler =
    (onComplete?: () => void) => () => {
      // Unlock vertices
      setLockedVertices({});
      // Mark the initial placement as completed
      initialPlacementCompleted.value = true;
      // Call the original onComplete handler
      onComplete?.();
    };

  const contextValue = useMemo<ForcesPlacementContextType<V>>(
    () => ({
      initialPlacementCompleted,
      lockedVertices,
      placedVerticesData
    }),
    [placedVerticesData, lockedVertices]
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
    ({ connections, edgesData, layoutAnimationSettings, verticesData }) => ({
      connections,
      edgesData,
      layoutAnimationSettings,
      verticesData
    })
  ),
  ({ componentsSettings, placementSettings }) => ({
    placementSettings,
    vertexRadius: componentsSettings.vertex.radius
  })
);
