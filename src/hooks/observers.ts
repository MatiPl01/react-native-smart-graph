import { useEffect, useRef, useState } from 'react';

import {
  Edge,
  Graph,
  GraphObserver,
  OrderedEdges,
  Vertex
} from '@/types/graphs';
import {
  AnimationSettings,
  AnimationsSettings
} from '@/types/settings/animations';

type GraphState<V, E> = {
  animationsSettings: AnimationsSettings;
  edges: Array<Edge<E, V>>;
  orderedEdges: OrderedEdges<E, V>;
  vertices: Array<Vertex<V, E>>;
};

export const useGraphObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [GraphState<V, E>, (isActive: boolean) => void] => {
  const [state, setState] = useState<GraphState<V, E>>({
    animationsSettings: {
      edges: {},
      vertices: {}
    },
    edges: graph.edges,
    orderedEdges: graph.orderedEdges,
    vertices: graph.vertices
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    graphChanged(animationsSettings) {
      setState({
        animationsSettings,
        edges: graph.edges,
        orderedEdges: graph.orderedEdges,
        vertices: graph.vertices
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

type FocusState = {
  animationSettings?: AnimationSettings | null;
  focusedVertexKey: null | string;
};

export const useFocusObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [FocusState, (isActive: boolean) => void] => {
  const [state, setState] = useState<FocusState>({
    animationSettings: {},
    focusedVertexKey: graph.focusedVertex?.key ?? null
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    focusChanged(vertexKey, animationSettings) {
      setState({
        animationSettings,
        focusedVertexKey: vertexKey
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
