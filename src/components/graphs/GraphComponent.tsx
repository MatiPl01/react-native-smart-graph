import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  SharedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { Group } from '@shopify/react-native-skia';

import { Graph } from '@/types/graphs';
import { PlacementSettings } from '@/types/placement';
import { VertexRendererProps } from '@/types/render';
import { placeVertices } from '@/utils/placement';
import { SHARED as SHARED_PLACEMENT_SETTINGS } from '@/utils/placement/constants';

import VertexComponent from './vertices/VertexComponent';

export type PrivateSharedGraphComponentProps = {
  setAnimatedContentDimensions: (dimensions: {
    width: SharedValue<number>;
    height: SharedValue<number>;
  }) => void;
};

export type SharedGraphComponentProps<V> = {
  vertexRenderer: (props: VertexRendererProps<V>) => JSX.Element;
};

type GraphComponentProps<V, E> = PrivateSharedGraphComponentProps &
  SharedGraphComponentProps<V> & {
    graph: Graph<V, E>;
    placementSettings?: PlacementSettings<V, E>;
  };

export default function GraphComponent<V, E>({
  graph,
  placementSettings,
  vertexRenderer,
  setAnimatedContentDimensions
}: GraphComponentProps<V, E>) {
  const containerWidth = useSharedValue(200); // TODO - update container size based on these dimensions
  const containerHeight = useSharedValue(200);

  const renderedVerticesCountRef = useRef(0);
  const verticesPositionsRef = useRef<
    Record<string, { x: SharedValue<number>; y: SharedValue<number> }>
  >({});

  const memoPlacementSettings = useMemo(
    () =>
      ({
        ...SHARED_PLACEMENT_SETTINGS,
        ...placementSettings
      } as Required<PlacementSettings<V, E>>),
    [placementSettings]
  );

  const graphLayout = useMemo(() => {
    // Reset the number of rendered vertices
    renderedVerticesCountRef.current = 0;

    // Calculate the new graph placement
    const result = placeVertices(graph, memoPlacementSettings);

    // Update the canvas dimensions
    containerWidth.value = result.width;
    containerHeight.value = result.height;

    return {
      ...result,
      verticesCount: Object.keys(result.verticesPositions).length
    };
  }, [graph, memoPlacementSettings]);

  useEffect(() => {
    setAnimatedContentDimensions({
      width: containerWidth,
      height: containerHeight
    });
  }, []);

  const memoVertexRenderer = useCallback(vertexRenderer, [vertexRenderer]);

  const setAnimatedVertexPosition = useCallback(
    (
      key: string,
      position: { x: SharedValue<number>; y: SharedValue<number> }
    ) => {
      verticesPositionsRef.current[key] = position;
      renderedVerticesCountRef.current++;

      if (renderedVerticesCountRef.current === graphLayout.verticesCount) {
        const center = {
          x: graphLayout.width / 2,
          y: graphLayout.height / 2
        };

        Object.values(verticesPositionsRef.current).forEach(({ x, y }) => {
          x.value = withRepeat(
            withTiming(x.value + 1.25 * (x.value - center.x), {
              duration: 1000
            }),
            Infinity,
            true
          );
          y.value = withRepeat(
            withTiming(y.value + 1.25 * (y.value - center.y), {
              duration: 1000
            }),
            Infinity,
            true
          );
        });
      }
    },
    [verticesPositionsRef.current]
  );

  return (
    <Group>
      {Object.entries(graphLayout.verticesPositions).map(
        ([key, placementPosition]) => (
          <VertexComponent<V, E>
            key={key}
            vertex={graph.vertex(key)}
            radius={memoPlacementSettings.vertexRadius}
            placementPosition={placementPosition}
            vertexRenderer={memoVertexRenderer}
            setAnimatedPosition={setAnimatedVertexPosition}
          />
        )
      )}
    </Group>
  );
}
