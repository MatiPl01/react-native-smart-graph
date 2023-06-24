import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import {
  AnimationsSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings/animations';

export interface Vertex<V, E> {
  get degree(): number;
  get edges(): Array<Edge<E, V>>;
  get key(): string;
  get neighbors(): Array<Vertex<V, E>>;
  get value(): V;
}

export interface Edge<E, V> {
  get key(): string;
  get value(): E;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
  isDirected(): boolean;
}

export type GraphConnections = Record<string, Array<string>>;

export type GraphObserver = {
  focusChanged?: (vertexKey: null | string) => void;
  graphChanged?: (animationsSettings: AnimationsSettings) => void;
};

export type OrderedEdges<E, V> = Array<{
  edge: Edge<E, V>;
  edgesCount: number;
  order: number;
}>;

export interface Graph<V, E> {
  addObserver(observer: GraphObserver): void;
  blur(): void;
  clear(animationSettings?: BatchModificationAnimationSettings | null): void;
  focus(vertexKey: string): void;
  get connections(): GraphConnections;
  get edges(): Array<Edge<E, V>>;
  get focusedVertex(): Vertex<V, E> | null;
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
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: SingleModificationAnimationSettings | null
  ): Edge<E, V>;
  insertVertex(
    data: VertexData<V>,
    animationSettings?: SingleModificationAnimationSettings | null
  ): Vertex<V, E>;
  isDirected(): boolean;
  removeBatch(
    data: {
      edges: Array<string>;
      vertices: Array<string>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
  removeEdge(
    key: string,
    animationSettings?: SingleModificationAnimationSettings | null
  ): E;
  removeObserver(observer: GraphObserver): void;
  removeVertex(
    key: string,
    animationSettings?: SingleModificationAnimationSettings | null
  ): V;
  replaceBatch(
    data: {
      edges?: Array<DirectedEdgeData<E> | UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void;
}
