import {Graph, Vertex} from '@/types/graphs';
import {DirectedGraph} from '@/models/graphs';

export const isGraphDirected = <V, E>(graph: Graph<V, E>): graph is DirectedGraph<V, E> => graph.isDirected();


export const isGraphConnected = <V, E>(graph: Graph<V, E>): boolean => {
    if (graph.vertices.length <= 1) {
        return true;
    }

    const visited: Record<string, boolean> = {};
    const stack: Array<Vertex<V, E>> = [graph.vertices[0] as Vertex<V, E>];

    while (stack.length > 0) {
        const vertex = stack.pop() as Vertex<V, E>;
        visited[vertex.key] = true;
        vertex.neighbours.forEach(neighbour => {
            if (!visited[neighbour.key]) {
                stack.push(neighbour);
            }
        });
    }

    return Object.keys(visited).length === graph.vertices.length;
};

export const isGraphAcyclic = <V, E>(graph: Graph<V, E>): boolean => {
    if (graph.vertices.length <= 1) {
        return true;
    }

    const visited: Record<string, boolean> = {};
    const stack: Array<Vertex<V, E>> = [graph.vertices[0] as Vertex<V, E>];

    while (stack.length > 0) {
        const vertex = stack.pop() as Vertex<V, E>;
        visited[vertex.key] = true;
        for (const neighbour of vertex.neighbours) {
            if (visited[neighbour.key]) {
                return false;
            }
            stack.push(neighbour);
        }
    }

    return true;
};

export const isGraphATree = <V, E>(graph: Graph<V, E>): boolean => {
    return isGraphConnected(graph) && isGraphAcyclic(graph);
};
