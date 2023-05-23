import { useEffect, useRef, useState } from 'react';

import { Edge, Graph, GraphObserver, Vertex } from '@/types/graphs';

export const useGraphObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [
  {
    vertices: Array<Vertex<V, E>>;
    edges: Array<Edge<E, V>>;
    orderedEdges: Array<{
      edge: Edge<E, V>;
      order: number;
      edgesCount: number;
    }>;
  },
  (value: boolean) => void
] => {
  const [state, setState] = useState({
    vertices: graph.vertices,
    edges: graph.edges,
    orderedEdges: graph.orderedEdges
  });
  const updateState = () => {
    setState({
      vertices: graph.vertices,
      edges: graph.edges,
      orderedEdges: graph.orderedEdges
    });
  };

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    graphChanged: updateState
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
