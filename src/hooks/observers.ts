import { useEffect, useRef, useState } from 'react';

import { DEFAULT_ANIMATION_SETTINGS } from '@/constants/animations';
import { AnimationSettingWithDefaults } from '@/types/animations';
import { Edge, Graph, GraphObserver, Vertex } from '@/types/graphs';

type State<V, E> = {
  vertices: Array<Vertex<V, E>>;
  edges: Array<Edge<E, V>>;
  orderedEdges: Array<{
    edge: Edge<E, V>;
    order: number;
    edgesCount: number;
  }>;
  animationSettings: AnimationSettingWithDefaults;
};

export const useGraphObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [State<V, E>, (value: boolean) => void] => {
  const [state, setState] = useState<State<V, E>>({
    vertices: graph.vertices,
    edges: graph.edges,
    orderedEdges: graph.orderedEdges,
    animationSettings: DEFAULT_ANIMATION_SETTINGS
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    graphChanged(animationSettings) {
      setState({
        vertices: graph.vertices,
        edges: graph.edges,
        orderedEdges: graph.orderedEdges,
        animationSettings
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
