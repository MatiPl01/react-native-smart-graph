import DirectedEdge from '../edges/DirectedEdge.model';
import DirectedGraphVertex from '../vertices/DirectedGraphVertex.model';
import Graph from './Graph.model';

export default class DirectedGraph<V, E> extends Graph<
  V,
  E,
  DirectedGraphVertex<V, E>,
  DirectedEdge<E, V>
> {
  isDirected(): this is DirectedGraph<V, E> {
    return true;
  }

  insertVertex(key: string, value: V): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(new DirectedGraphVertex<V, E>(key, value));
  }

  insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): DirectedEdge<E, V> {
    const source = this.vertex(sourceKey);
    const target = this.vertex(targetKey);

    const edge = new DirectedEdge<E, V>(edgeKey, value, source, target);
    this.insertEdgeObject(edge);

    source.addOutEdge(edge);
    target.addInEdge(edge);

    return edge;
  }

  removeEdge(key: string): E {
    const edge = this.edge(key);

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    delete this.edges$[key];

    return edge.value;
  }
}
