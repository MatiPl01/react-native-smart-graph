import DirectedEdge from '@/models/edges/DirectedEdge.model';
import DigraphVertex from '@/models/vertices/DigraphVertex.model';

import Graph from './Graph.model';

export default class Digraph<V, E> extends Graph<
  V,
  E,
  DigraphVertex<V, E>,
  DirectedEdge<E, V>
> {
  insertVertex(key: string, value: V): DigraphVertex<V, E> {
    return this.insertVertexObject(new DigraphVertex<V, E>(key, value));
  }

  insertEdge(
    vertex1key: string,
    vertex2key: string,
    edgeKey: string,
    value: E
  ): DirectedEdge<E, V> {
    return this.insertEdgeObject(
      new DirectedEdge<E, V>(
        edgeKey,
        value,
        this.vertex(vertex1key),
        this.vertex(vertex2key)
      )
    );
  }

  removeEdge(key: string): DirectedEdge<E, V> {
    const edge = this.edge(key);

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    delete this.edges$[key];

    return edge;
  }
}
