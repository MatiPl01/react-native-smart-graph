import { useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_FOCUS_SETTINGS } from '@/configs/graph';
import {
  Edge,
  EdgeObserver,
  Graph,
  GraphObserver,
  OrderedEdges,
  Vertex,
  VertexObserver
} from '@/types/models';
import {
  AllFocusSettings,
  GraphModificationAnimationsSettings
} from '@/types/settings';
import { updateValues } from '@/utils/objects';

export type GraphState<V, E> = {
  animationsSettings: GraphModificationAnimationsSettings;
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
  const observerRef = useRef<GraphObserver<V, E>>({
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
  settings: AllFocusSettings;
};

export const useFocusObserver = <V, E>(
  graph: Graph<V, E>,
  active = true
): [FocusState, (isActive: boolean) => void] => {
  const [state, setState] = useState<FocusState>({
    focusedVertexKey: null,
    settings: DEFAULT_FOCUS_SETTINGS
  });

  const isObservingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const observerRef = useRef<GraphObserver<V, E>>({
    focusChanged(vertexKey, settings) {
      setState({
        focusedVertexKey: vertexKey,
        settings: updateValues({
          current: state.settings,
          default: DEFAULT_FOCUS_SETTINGS,
          new: settings
        })
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

export const useVertexValueObserver = <V>(
  addObserver: (observer: VertexObserver<V>) => void,
  removeObserver: (observer: VertexObserver<V>) => void,
  initialValue: V
): V => {
  const [value, setValue] = useState<V>(initialValue);

  const vertexObserver = useMemo<VertexObserver<V>>(
    () => ({
      valueChanged: setValue
    }),
    []
  );

  useEffect(() => {
    addObserver(vertexObserver);
    return () => removeObserver(vertexObserver);
  }, [addObserver, removeObserver, vertexObserver]);

  return value;
};

export const useEdgeValueObserver = <E>(
  addObserver: (observer: EdgeObserver<E>) => void,
  removeObserver: (observer: EdgeObserver<E>) => void,
  initialValue: E
): E => {
  const [value, setValue] = useState<E>(initialValue);

  const edgeObserver = useMemo<EdgeObserver<E>>(
    () => ({
      valueChanged: setValue
    }),
    []
  );

  useEffect(() => {
    addObserver(edgeObserver);
    return () => removeObserver(edgeObserver);
  }, [addObserver, removeObserver, edgeObserver]);

  return value;
};
