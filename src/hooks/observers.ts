import { useEffect, useRef, useState } from 'react';

import {
  Edge,
  Graph,
  GraphObserver,
  OrderedEdges,
  Vertex
} from '@/types/graphs';
import { AnimationsSettings } from '@/types/settings/animations';
import { FocusSettingsWithDefaults } from '@/types/settings/focus';

export type GraphState<V, E> = {
  animationsSettings: AnimationsSettings;
  edges: Array<Edge<V, E>>;
  orderedEdges: OrderedEdges<V, E>;
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
  focusedVertexKey: null | string;
  settings: FocusSettingsWithDefaults;
};

export const useFocusObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [FocusState, (isActive: boolean) => void] => {
  const [state, setState] = useState<FocusState>({
    focusedVertexKey: null,
    settings: {
      disableGestures: false // Gestures will be enabled by default
    }
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver>({
    focusChanged(vertexKey, settings) {
      setState({
        focusedVertexKey: vertexKey,
        settings: {
          disableGestures: false,
          ...settings
        }
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
