// TODO - add documentation to all interfaces

import {
  AnimationSettings,
  AnimationSettingWithDefaults
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
  graphChanged(animationSettings: AnimationSettingWithDefaults): void;
};

export interface Graph<V, E> {
  get vertices(): Array<Vertex<V, E>>;
  get edges(): Array<Edge<E, V>>;
  get orderedEdges(): Array<{
    edge: Edge<E, V>;
    order: number;
    edgesCount: number;
  }>;
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
    animationSettings?: AnimationSettings | null
  ): Vertex<V, E>;
  insertEdge(
    data: DirectedEdgeData<E> | UndirectedEdgeData<E>,
    animationSettings?: AnimationSettings | null
  ): Edge<E, V>;
  removeVertex(key: string, animationSettings?: AnimationSettings | null): V;
  removeEdge(key: string, animationSettings?: AnimationSettings | null): E;
  clear(animationSettings?: AnimationSettings | null): void;
}
