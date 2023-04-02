import {Graph, Vertex} from '@/types/graphs';
import {DirectedGraph} from '@/models/graphs';

export const isGraphDirected = <V, E>(graph: Graph<V, E>): graph is DirectedGraph<V, E> => graph.isDirected();

export const isGraphConnected = <V, E>(graph: Graph<V, E>): boolean => {
    if (graph.vertices.length <= 1) return true;

    const visited: Record<string, boolean> = {};

    // const stack: Array<Vertex<V, E>> = [graph.vertices[0]];

    // const stack: Array<Vertex<V, E>> = [graph.vertices[0]];
    // while (stack.length > 0) {
    //     const vertex = stack.pop();
    //     visited[vertex.key] = true;
    //     vertex.outEdges.forEach(edge => {
    //         if (!visited[edge.target.key]) {
    //             queue.push(edge.target);
    //         }
    //     });
    //
    //     vertex.inEdges.forEach(edge => {
    //         if (!visited[edge.source.key]) {
    //             queue.push(edge.source);
    //         }
    //     });
    // }

    return Object.keys(visited).length === graph.vertices.length;
}
