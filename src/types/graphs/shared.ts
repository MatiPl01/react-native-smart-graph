import {
  AnimationsSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/animations';
import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';

export interface Vertex<V, E> {
  get key(): string;
  get value(): V;
  get edges(): Array<Edge<E, V>>;
  get neighbors(): Array<Vertex<V, E>>;
  get degree(): number;
}

export interface Edge<E, V> {
  get key(): string;
  get value(): E;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
}

export type GraphConnections = Record<string, Array<string>>;

export type GraphObserver = {
  graphChanged(animationsSettings: AnimationsSettings): void;
};

export type OrderedEdges<E, V> = Array<{
  edge: Edge<E, V>;
  order: number;
  edgesCount: number;
}>;

export interface Graph<V, E> {
  get vertices(): Array<Vertex<V, E>>;
  get edges(): Array<Edge<E, V>>;
  get orderedEdges(): OrderedEdges<E, V>;
  get connections(): GraphConnections;
  isDirected(): boolean;
  addObserver(observer: GraphObserver): void;
  removeObserver(observer: GraphObserver): void;
  hasVertex(key: string): boolean;
  hasEdge(key: string): boolean;
  getEdgesBetween(vertex1key: string, vertex2key: string): Array<Edge<E, V>>;
  getVertex(key: string): Vertex<V, E> | null;
  getEdge(key: string): Edge<E, V> | null;
  insertVertex(
    data: VertexData<V>,
    animationSettings?: SingleModificationAnimationSettings | null
  ): Vertex<V, E>;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: SingleModificationAnimationSettings | null
  ): Edge<E, V>;
  removeVertex(
    key: string,
    animationSettings?: SingleModificationAnimationSettings | null
  ): V;
  removeEdge(
    key: string,
    animationSettings?: SingleModificationAnimationSettings | null
  ): E;
  insertBatch(
    data: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
  removeBatch(
    data: {
      vertices: Array<string>;
      edges: Array<string>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
  replaceBatch(
    data: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
  clear(animationSettings?: BatchModificationAnimationSettings | null): void;
}
