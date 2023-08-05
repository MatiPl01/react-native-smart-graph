import {
  DirectedEdgeData,
  UndirectedEdgeData,
  VertexData
} from '@/types/data/public';
import { Edge, OrderedEdges } from '@/types/models/public/edge';
import { GraphObserver } from '@/types/models/public/observer';
import { Vertex, VertexConnections } from '@/types/models/public/vertex';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings/public/graph/animations';
import { FocusSettings } from '@/types/settings/public/graph/focus';
import { Maybe } from '@/types/utils';

/* eslint-disable import/no-unused-modules */
export interface Graph<V, E> {
  addObserver(observer: GraphObserver): void;
  blur(settings?: Maybe<AnimationSettings>): void;
  clear(animationSettings?: Maybe<BatchModificationAnimationSettings>): void;
  focus(vertexKey: string, settings?: FocusSettings): void;
  get connections(): GraphConnections;
  get edges(): Array<Edge<V, E>>;
  get orderedEdges(): OrderedEdges<V, E>;
  get vertices(): Array<Vertex<V, E>>;
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
    animationSettings?: Maybe<BatchModificationAnimationSettings>,
    notifyChange?: boolean
  ): void;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange?: boolean
  ): Edge<V, E>;
  insertVertex(
    data: VertexData<V>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange?: boolean
  ): Vertex<V, E>;
  isDirected(): boolean;
  removeBatch(
    data: {
      edges: Array<string>;
      vertices: Array<string>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>,
    notifyChange?: boolean
  ): void;
  removeEdge(
    key: string,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange?: boolean
  ): E | undefined;
  removeObserver(observer: GraphObserver): void;
  removeVertex(
    key: string,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange?: boolean
  ): V | undefined;
  replaceBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>,
    notifyChange?: boolean
  ): void;
}

export type GraphConnections = Record<string, VertexConnections>;
