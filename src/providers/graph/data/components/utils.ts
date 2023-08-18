import { makeMutable } from 'react-native-reanimated';

import { GraphState } from '@/hooks';
import { GraphComponentsData } from '@/types/components';
import {
  EdgeComponentData,
  EdgeRemoveHandler,
  LabelComponentData,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/data';
import { GraphConnections, OrderedEdges, Vertex } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  AnimationSettings
} from '@/types/settings';
import { PartialWithRequired } from '@/types/utils';
import {
  cancelEdgeAnimations,
  cancelVertexAnimations
} from '@/utils/animations';
import { updateValues } from '@/utils/objects';

export type ComponentsData<V, E> = {
  connections: GraphConnections;
  graphAnimationsSettings: AllGraphAnimationsSettings;
  isGraphDirected: boolean;
  // Store keys of removed edges for which the removal animation
  // has been completed and edges are waiting to be unmounted
  removedEdges: Set<string>;
  // Store keys of removed vertices for which the removal animation
  // has been completed and vertices are waiting to be unmounted
  removedVertices: Set<string>;
  renderLabels: boolean;
  state: GraphState<V, E>;
};

export const createContextValue = <V, E>(
  data: ComponentsData<V, E>,
  removeHandlers: {
    handleEdgeRemove: EdgeRemoveHandler;
    handleVertexRemove: VertexRemoveHandler;
  }
): GraphComponentsData<V, E> => updateContextValue(removeHandlers, data);

const SHARED_KEYS = {
  connections: 'shallow', // 'shallow' - shallow compare
  edgeLabelsData: 'shallow',
  edgesData: 'shallow',
  isGraphDirected: 'shared', // 'shared' - replace with shared value
  targetBoundingRect: 'shared',
  verticesData: 'shallow'
};

export const updateContextValue = <V, E>(
  value: PartialWithRequired<
    GraphComponentsData<V, E>,
    'handleEdgeRemove' | 'handleVertexRemove'
  >,
  newData: ComponentsData<V, E>,
  currentData?: ComponentsData<V, E>
): GraphComponentsData<V, E> => {
  const currentLayoutAnimationSettings = value?.layoutAnimationSettings;
  const newLayoutAnimationSettings = updateValues({
    current: currentLayoutAnimationSettings,
    default: newData.graphAnimationsSettings.layout,
    new: newData.state.animationsSettings.layout
  });

  // Update vertices data only if vertices have changed
  const newVerticesData =
    newData.state.vertices !== currentData?.state.vertices ||
    newData.removedVertices.size
      ? updateGraphVerticesData(
          value?.verticesData ?? {},
          newData.state.vertices,
          newData.removedVertices,
          newData.state.animationsSettings.vertices,
          newData.graphAnimationsSettings.vertices
        )
      : value?.verticesData ?? {};

  // Update edges data only if edges have changed
  const newEdgesData =
    newData.state.edges !== currentData?.state.edges ||
    newData.removedEdges.size
      ? updateGraphEdgesData(
          value?.edgesData ?? {},
          newData.state.orderedEdges,
          newVerticesData,
          newData.removedEdges,
          newData.state.animationsSettings.edges,
          newData.graphAnimationsSettings.edges
        )
      : value?.edgesData ?? {};

  const newLabelsData =
    // Update edge labels data only if edges have changed and labels are rendered
    newData.renderLabels && newEdgesData !== value?.edgesData
      ? updateGraphEdgeLabelsData(value?.edgeLabelsData ?? {}, newEdgesData)
      : // Remove edge labels data if labels are not rendered anymore
      !newData.renderLabels && currentData?.renderLabels
      ? {}
      : // Use previous edge labels data if labels are rendered and edges have not changed
        value?.edgeLabelsData ?? {};

  return updateValues(
    {
      current: value,
      new: {
        // Always take new connections as the graph model takes care of
        // updating the connections when the graph is updated
        connections: newData.connections,
        edgeLabelsData: newLabelsData,
        edgesData: newEdgesData,
        handleEdgeRemove: value.handleEdgeRemove, // Prevent removing
        handleVertexRemove: value.handleVertexRemove, // Prevent removing
        isGraphDirected: newData.isGraphDirected,
        layoutAnimationSettings: newLayoutAnimationSettings,
        // Prevent removing or create the initial value if it doesn't exist
        targetBoundingRect: value?.targetBoundingRect ?? {
          bottom: 0,
          left: 0,
          right: 0,
          top: 0
        },
        verticesData: newVerticesData
      }
    },
    SHARED_KEYS
  );
};

const updateGraphVerticesData = <V, E>(
  oldVerticesData: Record<string, VertexComponentData<V, E>>,
  currentVertices: Array<Vertex<V, E>>,
  removedVertices: Set<string>,
  currentAnimationsSettings: Record<string, AnimationSettings | undefined>,
  defaultAnimationSettings: AllAnimationSettings
): Record<string, VertexComponentData<V, E>> => {
  const updatedVerticesData = { ...oldVerticesData };
  let isModified = false;

  // Add new vertices
  for (const vertex of currentVertices) {
    // Remove vertex from the removed vertices set if it is in graph
    if (removedVertices.has(vertex.key)) {
      removedVertices.delete(vertex.key);
    }

    // Continue if vertex is already in the graph, is not removed
    // and data is not changed
    const oldVertex = oldVerticesData[vertex.key];
    // The shallow equality check is enough here because the vertex data
    // shouldn't be modified in place
    if (oldVertex && !oldVertex.removed && oldVertex.vertex === vertex) {
      continue;
    }

    isModified = true;
    // Create the vertex data
    updatedVerticesData[vertex.key] = {
      ...(oldVertex ?? {
        // Create shared values only for new vertices
        currentRadius: makeMutable(0),
        displayed: makeMutable(true),
        position: {
          x: makeMutable(0),
          y: makeMutable(0)
        },
        scale: makeMutable(1)
      }),
      animationSettings: {
        ...defaultAnimationSettings,
        ...currentAnimationsSettings
      },
      removed: false,
      vertex
    };
  }

  // Keys of vertices that are currently in the graph
  const currentVerticesKeys = new Set(currentVertices.map(v => v.key));

  // Mark vertices as removed if they were removed from the graph model
  for (const key in oldVerticesData) {
    const vertexData = oldVerticesData[key];
    if (vertexData && !currentVerticesKeys.has(key) && !vertexData.removed) {
      isModified = true;
      updatedVerticesData[key] = {
        ...vertexData,
        animationSettings: {
          ...defaultAnimationSettings,
          ...currentAnimationsSettings
        },
        removed: true
      };
    }
  }

  // Remove vertices from vertices data if their removal animation is finished
  // and they weren't added back to the graph model
  for (const key of removedVertices) {
    const vertexData = updatedVerticesData[key];
    if (vertexData) cancelVertexAnimations(vertexData);
    delete updatedVerticesData[key];
    removedVertices.delete(key);
    isModified = true;
  }

  return isModified ? updatedVerticesData : oldVerticesData;
};

const updateGraphEdgesData = <V, E>(
  oldEdgesData: Record<string, EdgeComponentData<V, E>>,
  currentEdges: OrderedEdges<V, E>,
  verticesData: Record<string, VertexComponentData<V, E>>,
  removedEdges: Set<string>,
  currentAnimationsSettings: Record<string, AnimationSettings | undefined>,
  defaultAnimationSettings: AllAnimationSettings
): Record<string, EdgeComponentData<V, E>> => {
  const updatedEdgesData = { ...oldEdgesData };
  let isModified = false; // Flag to indicate if edges data was updated

  // Add new edges to edges data
  for (const edgeData of currentEdges) {
    // Remove edge from the removed edges set if it is in graph
    if (removedEdges.has(edgeData.edge.key)) {
      removedEdges.delete(edgeData.edge.key);
    }

    // Continue if edge is already in the graph, is not removed and data
    // is not changed
    const oldEdge = oldEdgesData[edgeData.edge.key];
    if (oldEdge && !oldEdge.removed && oldEdge.edge === edgeData.edge) {
      // Update shared values if they were changed
      if (oldEdge.order.value !== edgeData.order) {
        oldEdge.order.value = edgeData.order;
      }
      if (oldEdge.edgesCount.value !== edgeData.edgesCount) {
        oldEdge.edgesCount.value = edgeData.edgesCount;
      }
      continue;
    }

    // Continue if vertices of the edge are not rendered yet
    const [v1, v2] = edgeData.edge.vertices;
    const v1Data = verticesData[v1.key];
    const v2Data = verticesData[v2.key];
    if (!v1Data || !v2Data) continue;

    isModified = true;
    // Create the edge data
    updatedEdgesData[edgeData.edge.key] = {
      ...(oldEdge ?? {
        animationProgress: makeMutable(0),
        // Create shared values only for new edges
        displayed: makeMutable(true),
        edgesCount: makeMutable(edgeData.edgesCount),
        labelHeight: makeMutable(0),
        labelPosition: {
          x: makeMutable(0),
          y: makeMutable(0)
        },
        order: makeMutable(edgeData.order)
      }),
      animationSettings: {
        ...defaultAnimationSettings,
        ...currentAnimationsSettings
      },
      edge: edgeData.edge,
      removed: false,
      v1Position: v1Data.position,
      v1Radius: v1Data.currentRadius,
      v2Position: v2Data.position,
      v2Radius: v2Data.currentRadius
    };
  }

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(currentEdges.map(e => e.edge.key));

  // Mark edges as removed if there were removed from the graph model
  for (const key in oldEdgesData) {
    const edgeData = oldEdgesData[key];
    if (edgeData && !currentEdgesKeys.has(key)) {
      if (!edgeData.removed) {
        isModified = true;
        updatedEdgesData[key] = {
          ...edgeData,
          animationSettings: {
            ...defaultAnimationSettings,
            ...currentAnimationsSettings
          },
          removed: true
        };
      }
    }
  }

  // Remove edges from edges data if their removal animation is finished
  // and they weren't added back to the graph model
  for (const key of removedEdges) {
    const edgeData = updatedEdgesData[key];
    if (edgeData) cancelEdgeAnimations(edgeData);
    delete updatedEdgesData[key];
    removedEdges.delete(key);
    isModified = true;
  }

  return isModified ? updatedEdgesData : oldEdgesData;
};

const updateGraphEdgeLabelsData = <V, E>(
  oldEdgeLabelsData: Record<string, LabelComponentData<E>>,
  edgesData: Record<string, EdgeComponentData<V, E>>
): Record<string, LabelComponentData<E>> => {
  const updatedEdgeLabelsData = { ...oldEdgeLabelsData };
  let isModified = false; // Flag to indicate if edges data was updated

  // Add new labels data
  for (const key in edgesData) {
    const edgeData = edgesData[key];
    const oldLabelData = oldEdgeLabelsData[key];
    // Update label data if it is not rendered yet or its value was changed
    if (
      edgeData &&
      (!oldLabelData || oldLabelData.value !== edgeData.edge.value)
    ) {
      isModified = true;
      updatedEdgeLabelsData[key] = {
        animationProgress: edgeData.animationProgress,
        centerX: edgeData.labelPosition.x,
        centerY: edgeData.labelPosition.y,
        height: edgeData.labelHeight,
        v1Position: edgeData.v1Position,
        v2Position: edgeData.v2Position,
        value: edgeData.edge.value
      };
    }
  }

  // Remove labels data of edges that are no longer displayed
  // (their unmount animation is finished)
  for (const key in oldEdgeLabelsData) {
    if (!edgesData[key]) {
      delete updatedEdgeLabelsData[key];
      isModified = true;
    }
  }

  return isModified ? updatedEdgeLabelsData : oldEdgeLabelsData;
};
