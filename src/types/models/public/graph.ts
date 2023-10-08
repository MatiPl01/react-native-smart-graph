import {
  DirectedEdgeData,
  DirectedGraphData,
  UndirectedEdgeData,
  UndirectedGraphData,
  VertexData
} from '@/types/data';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  FocusSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';
import { ChangeResult } from '@/utils/models';

import { Edge, OrderedEdges } from './edge';
import { GraphObserver } from './observer';
import { Vertex, VertexConnections } from './vertex';

export interface Graph<V, E> {
  addObserver(observer: GraphObserver): void;
  blur(settings?: Maybe<AnimationSettings>): void;
  clear(animationSettings?: BatchModificationAnimationSettings): ChangeResult;
  focus(vertexKey: string, settings?: FocusSettings): void;
  get connections(): GraphConnections;
  get edges(): Array<Edge<V, E>>;
  get edgesData(): Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
  get graphData(): DirectedGraphData<V, E> | UndirectedGraphData<V, E>;
  get orderedEdges(): OrderedEdges<V, E>;
  get vertices(): Array<Vertex<V, E>>;
  get verticesData(): Array<VertexData<V>>;
  getEdge(key: string): Edge<V, E> | null;
  getEdgesBetween(vertex1key: string, vertex2key: string): Array<Edge<V, E>>;
  getVertex(key: string): Vertex<V, E> | null;
  hasEdge(key: string): boolean;
  hasVertex(key: string): boolean;
  insertBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: BatchModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  insertVertex(
    data: VertexData<V>,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  isDirected(): boolean;
  removeBatch(
    data: {
      edges: Array<string>;
      vertices: Array<string>;
    },
    animationSettings?: BatchModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  removeEdge(
    key: string,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  removeObserver(observer: GraphObserver): void;
  removeVertex(
    key: string,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
  replaceBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: BatchModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
}

export type GraphConnections = Record<string, VertexConnections>;
