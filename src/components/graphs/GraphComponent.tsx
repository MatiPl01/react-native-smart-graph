import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

export type MeasureEvent = {
  // TODO - remove this
  layout: {
    width: number;
    height: number;
  };
};

export type TempProps = {
  // TODO - remove this
  onMeasure: (event: MeasureEvent) => void;
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
  onMeasure
}: GraphComponentProps<V, E, S, R> & TempProps) {
  const [areAllVerticesRendered, setAreAllVerticesRendered] = useState(false);

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

    return {
      ...placeVertices(
        graph,
        memoSettings.components.vertex.radius,
        memoSettings.placement
      ),
      verticesCount: graph.vertices.length
    };
  }, [graph]);

  useEffect(() => {
    // TODO - improve this
    onMeasure({
      layout: {
        width: graphLayout.width,
        height: graphLayout.height
      }
    });
  }, [graphLayout]);

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
