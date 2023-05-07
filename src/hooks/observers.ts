import { useEffect, useMemo, useRef, useState } from 'react';

import { Edge, Graph, Vertex } from '@/types/graphs';

export const useGraphObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [
  { vertices: Array<Vertex<V, E>>; edges: Array<Edge<E, V>> },
  (value: boolean) => void
] => {
  const [state, setState] = useState({
    vertices: graph.vertices,
    edges: graph.edges
  });
  const updateState = () => {
    setState({
      vertices: graph.vertices,
      edges: graph.edges
    });
  };

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observer = useMemo(
    () => ({
      vertexAdded: updateState,
      vertexRemoved: updateState,
      edgeAdded: updateState,
      edgeRemoved: updateState
    }),
    []
  );

  if (isFirstRenderRef.current) {
    graph.addObserver(observer);
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
      graph.addObserver(observer);
      isObservingRef.current = true;
    } else if (!value && isObservingRef.current) {
      graph.removeObserver(observer);
      isObservingRef.current = false;
    }
  };

  return [state, setActive];
};
