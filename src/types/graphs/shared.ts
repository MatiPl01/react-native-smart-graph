import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import {
  AnimationSettings,
  AnimationsSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings/animations';
import { FocusSettings } from '@/types/settings/focus';

export interface Vertex<V, E> {
  get degree(): number;
  get edges(): Array<Edge<E, V>>;
  get key(): string;
  get neighbors(): Array<Vertex<V, E>>;
  get value(): V | undefined;
}

export interface Edge<E, V> {
  get key(): string;
  get value(): E | undefined;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
}

export type GraphConnections = Record<string, Array<string>>;

export type GraphObserver = {
  focusChanged?: (vertexKey: null | string, settings?: FocusSettings) => void;
  graphChanged?: (animationsSettings: AnimationsSettings) => void;
};

export type OrderedEdges<E, V> = Array<{
  edge: Edge<E, V>;
  edgesCount: number;
  order: number;
}>;

export interface Graph<V, E> {
  addObserver(observer: GraphObserver): void;
  blur(settings?: Maybe<AnimationSettings>): void;
  clear(animationSettings?: Maybe<BatchModificationAnimationSettings>): void;
  focus(vertexKey: string, settings?: FocusSettings): void;
  get connections(): GraphConnections;
  get edges(): Array<Edge<E, V>>;
  get orderedEdges(): OrderedEdges<E, V>;
  get vertices(): Array<Vertex<V, E>>;
  getEdge(key: string): Edge<E, V> | null;
  getEdgesBetween(vertex1key: string, vertex2key: string): Array<Edge<E, V>>;
  getVertex(key: string): Vertex<V, E> | null;
  hasEdge(key: string): boolean;
  hasVertex(key: string): boolean;
  insertBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
  ): Edge<E, V>;
  insertVertex(
    data: VertexData<V>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
  ): Vertex<V, E>;
  isDirected(): boolean;
  removeBatch(
    data: {
      edges: Array<string>;
      vertices: Array<string>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void;
  removeEdge(
    key: string,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
  ): E | undefined;
  removeObserver(observer: GraphObserver): void;
  removeVertex(
    key: string,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
  ): V | undefined;
  replaceBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void;
}
