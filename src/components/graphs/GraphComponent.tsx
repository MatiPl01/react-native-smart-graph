import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { Group } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
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
    Record<
      string,
      {
        x: SharedValue<number>;
        y: SharedValue<number>;
      }
    >
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

  const memoRenderers = useMemo(() => {
    const defaultRenderers = {
      vertex: DefaultVertexRenderer,
      edge: {
        arrow: graph.isDirected() ? DefaultEdgeArrowRenderer : undefined,
        edge: DefaultEdgeRenderer
        // label: null // TODO
      }
    };

    return {
      ...defaultRenderers,
      ...renderers
    };
  }, [renderers]);

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
    (
      key: string,
      position: { x: SharedValue<number>; y: SharedValue<number> }
    ) => {
      verticesPositionsRef.current[key] = position;

      if (++renderedVerticesCountRef.current === graphLayout.verticesCount) {
        setAreAllVerticesRendered(true);

        // const center = {
        //   x: graphLayout.width / 2,
        //   y: graphLayout.height / 2
        // };

        // Object.values(verticesPositionsRef.current).forEach(({ x, y }) => {
        //   x.value = withRepeat(
        //     withTiming(x.value + 1.25 * (x.value - center.x), {
        //       duration: 1000
        //     }),
        //     Infinity,
        //     true
        //   );
        //   y.value = withRepeat(
        //     withTiming(y.value + 1.25 * (y.value - center.y), {
        //       duration: 1000
        //     }),
        //     Infinity,
        //     true
        //   );
        // });
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
