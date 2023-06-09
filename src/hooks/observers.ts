import { useEffect, useRef, useState } from 'react';

import { Edge, Graph, GraphObserver, Vertex } from '@/types/graphs';
import { AnimationsSettings } from '@/types/settings/animations';

type State<V, E> = {
  vertices: Array<Vertex<V, E>>;
  edges: Array<Edge<E, V>>;
  orderedEdges: Array<{
    edge: Edge<E, V>;
    order: number;
    edgesCount: number;
  }>;
  animationsSettings: AnimationsSettings;
};

export const useGraphObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [State<V, E>, (value: boolean) => void] => {
  const [state, setState] = useState<State<V, E>>({
    vertices: graph.vertices,
    edges: graph.edges,
    orderedEdges: graph.orderedEdges,
    animationsSettings: {
      vertices: {},
      edges: {}
    }
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    graphChanged(animationsSettings) {
      setState({
        vertices: graph.vertices,
        edges: graph.edges,
        orderedEdges: graph.orderedEdges,
        animationsSettings
      });
    }
  });

  if (isFirstRenderRef.current) {
    graph.addObserver(observerRef.current);
    isFirstRenderRef.current = false;
    if (active) {
      isObservingRef.current = true;
    }
  }

  useEffect(() => {
    setActive(active);

    return () => setActive(false);
  }, [active]);

  const setActive = (value: boolean) => {
    if (value && !isObservingRef.current) {
      graph.addObserver(observerRef.current);
      isObservingRef.current = true;
    } else if (!value && isObservingRef.current) {
      graph.removeObserver(observerRef.current);
      isObservingRef.current = false;
    }
  };

  return [state, setActive];
};
