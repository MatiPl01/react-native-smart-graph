import { useCallback, useMemo, useRef, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { Group } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import { placeVertices } from '@/utils/placement';

import EdgeComponent, { EdgeComponentProps } from './edges/EdgeComponent';
import DefaultEdgeArrowRenderer from './renderers/DefaultEdgeArrowRenderer';
import DefaultEdgeRenderer from './renderers/DefaultEdgeRenderer';
import DefaultVertexRenderer from './renderers/DefaultVertexRenderer';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentPrivateProps = {
  setContentDimensions: (
    width: SharedValue<number>,
    height: SharedValue<number>
  ) => void;
};

type GraphComponentProps<
  V,
  E,
  S extends GraphSettings<V, E>,
  R extends GraphRenderers<V, E>
> = {
  graph: Graph<V, E>;
  settings?: S;
  renderers?: R;
};

export default function GraphComponent<
  V,
  E,
  S extends GraphSettings<V, E>,
  R extends GraphRenderers<V, E>
>({
  graph,
  settings,
  renderers,
  setContentDimensions
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps) {
  const [areAllVerticesRendered, setAreAllVerticesRendered] = useState(false);

  const contentWidth = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const renderedVerticesCountRef = useRef(0);
  const verticesPositionsRef = useRef<
    Record<string, AnimatedPositionCoordinates>
  >({});

  const memoSettings = useMemo(
    () => ({
      ...settings,
      components: {
        ...settings?.components,
        vertex: {
          ...VERTEX_COMPONENT_SETTINGS,
          ...settings?.components?.vertex
        },
        edge: {
          ...settings?.components?.edge
        }
      }
    }),
    [settings]
  );

  const memoRenderers = useMemo(
    () => ({
      vertex: DefaultVertexRenderer,
      edge: {
        arrow: graph.isDirected() ? DefaultEdgeArrowRenderer : undefined,
        edge: DefaultEdgeRenderer,
        label: renderers?.edgeLabel
      }
    }),
    [renderers]
  );

  const graphLayout = useMemo(() => {
    renderedVerticesCountRef.current = 0;

    const layout = placeVertices(
      graph,
      memoSettings.components.vertex.radius,
      memoSettings.placement
    );

    contentHeight.value = layout.height;
    contentWidth.value = layout.width;
    setContentDimensions(contentWidth, contentHeight);

    return {
      ...layout,
      verticesCount: graph.vertices.length
    };
  }, [graph]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedPositionCoordinates) => {
      verticesPositionsRef.current[key] = position;

      if (++renderedVerticesCountRef.current === graphLayout.verticesCount) {
        setAreAllVerticesRendered(true);
      }
    },
    [verticesPositionsRef.current]
  );

  const renderEdges = useCallback(() => {
    return graph.edges.map(edge => (
      <EdgeComponent
        key={edge.key}
        {...({
          edge,
          verticesPositions: verticesPositionsRef.current,
          renderers: memoRenderers.edge,
          settings: memoSettings.components.edge
        } as EdgeComponentProps<E, V>)}
      />
    ));
  }, [graph]);

  const renderVertices = useCallback(
    () =>
      Object.entries(graphLayout.verticesPositions).map(
        ([key, placementPosition]) => (
          <VertexComponent<V, E>
            key={key}
            vertex={graph.vertex(key)}
            settings={memoSettings.components.vertex}
            placementPosition={placementPosition}
            setAnimatedPosition={setAnimatedVertexPosition}
            renderer={memoRenderers.vertex}
          />
        )
      ),
    [graphLayout, graph]
  );

  return (
    <Group>
      {areAllVerticesRendered && renderEdges()}
      {renderVertices()}
    </Group>
  );
}
