import {
  DirectedEdgeData,
  EdgeData,
  UndirectedEdgeData,
  VertexData
} from '@/types/data';

export const isVertexData = <V>(data: any): data is VertexData<V> =>
  Object.hasOwn(data, 'key') &&
  Object.hasOwn(data, 'value') &&
  !isEdgeData(data);

export const isDirectedEdgeData = <E>(data: any): data is DirectedEdgeData<E> =>
  Object.hasOwn(data, 'from');

export const isUndirectedEdgeData = <E>(
  data: any
): data is UndirectedEdgeData<E> => Object.hasOwn(data, 'vertices');

export const isEdgeData = <V, E>(data: any): data is EdgeData<E> =>
  isDirectedEdgeData(data) || isUndirectedEdgeData(data);
