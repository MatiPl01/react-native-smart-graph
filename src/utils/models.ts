import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import { DirectedEdge, UndirectedEdge, Vertex } from '@/types/models';
import { WithValue } from '@/types/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ChangeResult<T = void> = {
  data?: T;
} & (
  | {
      error: string;
      success: false;
    }
  | {
      success: true;
    }
);

type AnyFunction = (...props: Array<any>) => any;

type WithChangeResult<F extends AnyFunction> = (
  ...props: Parameters<F>
) => ChangeResult<ReturnType<F>>;

export const catchError =
  <F extends AnyFunction>(fn: F): WithChangeResult<F> =>
  (...props) => {
    try {
      return {
        data: fn(...props) as ReturnType<F>,
        success: true
      };
    } catch (error) {
      return {
        error: (error as Error).message,
        success: false
      };
    }
  };

export const hasValue = <T extends object, V>(
  obj: T | WithValue<V, T>
): obj is WithValue<V, T> => Object.hasOwn(obj, 'value');

export const getVertexData = <V, E>(vertex: Vertex<V, E>): VertexData<V> =>
  (hasValue(vertex)
    ? { key: vertex.key, value: vertex.value }
    : { key: vertex.key }) as VertexData<V>;

export const getDirectedEdgeData = <V, E>(
  edge: DirectedEdge<V, E>
): DirectedEdgeData<E> =>
  (hasValue(edge)
    ? {
        from: edge.source.key,
        key: edge.key,
        to: edge.target.key,
        value: edge.value
      }
    : {
        from: edge.source.key,
        key: edge.key,
        to: edge.target.key
      }) as DirectedEdgeData<E>;

export const getUndirectedEdgeData = <V, E>(
  edge: UndirectedEdge<V, E>
): UndirectedEdgeData<E> =>
  (hasValue(edge)
    ? {
        key: edge.key,
        value: edge.value,
        vertices: edge.vertices.map(({ key }) => key)
      }
    : {
        key: edge.key,
        vertices: edge.vertices.map(({ key }) => key)
      }) as UndirectedEdgeData<E>;
