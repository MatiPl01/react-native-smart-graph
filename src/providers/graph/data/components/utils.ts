import { Transforms2d } from '@shopify/react-native-skia';
import { makeMutable } from 'react-native-reanimated';

import { DEFAULT_ANIMATION_SETTINGS } from '@/constants/animations';
import { GraphState } from '@/hooks';
import { GraphComponentsData } from '@/types/components';
import {
  EdgeComponentData,
  EdgeLabelComponentData,
  EdgeRemoveHandler,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/data';
import { VertexLabelComponentData } from '@/types/data/private/vertexLabel';
import { GraphConnections, OrderedEdges, Vertex } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphAnimationsSettings,
  AnimationSettings
} from '@/types/settings';
import { Maybe, PartialWithRequired } from '@/types/utils';
import {
  cancelEdgeAnimations,
  cancelVertexAnimations
} from '@/utils/animations';
import { updateValues } from '@/utils/objects';
import { getVertexPosition } from '@/utils/transform';

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
  renderEdgeLabels: boolean;
  renderVertexLabels: boolean;
  state: GraphState<V, E>;
};

type AdditionalValues = {
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
};

export const createContextValue = <V, E>(
  data: ComponentsData<V, E>,
  additionalValues: AdditionalValues
): GraphComponentsData<V, E> => updateContextValue(additionalValues, data);

const UPDATE_CONFIG = {
  connections: 'shallow', // 'shallow' - shallow compare
  edgeLabelsData: 'shallow',
  edgeLabelsRendered: 'shared', // 'shared' - replace with shared value
  edgesData: 'shallow',
  isGraphDirected: 'shared',
  vertexLabelsData: 'shallow',
  vertexLabelsRendered: 'shared',
  verticesData: 'shallow'
};

export const updateContextValue = <V, E>(
  value: PartialWithRequired<GraphComponentsData<V, E>, keyof AdditionalValues>,
  newData: ComponentsData<V, E>,
  currentData?: ComponentsData<V, E>
): GraphComponentsData<V, E> => {
  const currentLayoutAnimationSettings = value?.layoutAnimationSettings;
  const newLayoutAnimationSettings =
    newData.state.animationsSettings.layout === null
      ? null
      : updateValues({
          current: currentLayoutAnimationSettings,
          default:
            newData.graphAnimationsSettings.layout ??
            newData.state.animationsSettings.layout,
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

  // Update vertex labels data only if vertices have changed and labels are rendered
  const newVerticesLabelsData =
    newData.renderVertexLabels && newVerticesData !== value?.verticesData
      ? updateGraphVertexLabelsData(
          value?.vertexLabelsData ?? {},
          newVerticesData
        )
      : // Remove vertex labels data if labels are not rendered anymore
      !newData.renderVertexLabels && currentData?.renderVertexLabels
      ? {}
      : // Use previous vertex labels data if labels are rendered and vertices have not changed
        value?.vertexLabelsData ?? {};

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

  // Update edge labels data only if edges have changed and labels are rendered
  const newEdgeLabelsData =
    newData.renderEdgeLabels && newEdgesData !== value?.edgesData
      ? updateGraphEdgeLabelsData(value?.edgeLabelsData ?? {}, newEdgesData)
      : // Remove edge labels data if labels are not rendered anymore
      !newData.renderEdgeLabels && currentData?.renderEdgeLabels
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
        edgeLabelsData: newEdgeLabelsData,
        edgeLabelsRendered: newData.renderEdgeLabels,
        edgesData: newEdgesData,
        handleEdgeRemove: value.handleEdgeRemove, // Prevent removing
        handleVertexRemove: value.handleVertexRemove, // Prevent removing
        isGraphDirected: newData.isGraphDirected,
        layoutAnimationSettings: newLayoutAnimationSettings,
        vertexLabelsData: newVerticesLabelsData,
        vertexLabelsRendered: newData.renderVertexLabels,
        verticesData: newVerticesData
      }
    },
    UPDATE_CONFIG
  );
};

const updateAnimationSettings = (
  defaultSettings: AllAnimationSettings | null,
  currentSettings?: AnimationSettings | null
): AllAnimationSettings | null => {
  if (
    currentSettings === null ||
    (defaultSettings === null && !currentSettings)
  ) {
    return null;
  }
  return {
    ...(defaultSettings ?? DEFAULT_ANIMATION_SETTINGS),
    ...currentSettings
  };
};

const updateGraphVerticesData = <V, E>(
  oldVerticesData: Record<string, VertexComponentData<V>>,
  currentVertices: Array<Vertex<V, E>>,
  removedVertices: Set<string>,
  currentAnimationsSettings: Record<string, Maybe<AnimationSettings>> | null,
  defaultAnimationSettings: AllAnimationSettings | null
): Record<string, VertexComponentData<V>> => {
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
    if (
      oldVertex &&
      !oldVertex.removed &&
      oldVertex.key === vertex.key &&
      oldVertex.value === vertex.value
    ) {
      continue;
    }

    // Create the vertex data
    updatedVerticesData[vertex.key] = {
      ...(oldVertex ?? {
        // Create shared values only for new vertices
        animationProgress: makeMutable(0),
        focusProgress: makeMutable(0),
        isModified: makeMutable(true),
        label: {
          transform: makeMutable<Transforms2d>([])
        },
        points: makeMutable({
          source: { x: 0, y: 0 },
          target: { x: 0, y: 0 }
        }),
        scale: makeMutable(1),
        transformProgress: makeMutable(0)
      }),
      animationSettings: updateAnimationSettings(
        defaultAnimationSettings,
        currentAnimationsSettings && currentAnimationsSettings[vertex.key]
      ),
      key: vertex.key,
      removed: false,
      value: vertex.value
    };
    isModified = true; // Mark as modified to set the new vertices data object
  }

  // Keys of vertices that are currently in the graph
  const currentVerticesKeys = new Set(currentVertices.map(v => v.key));

  // Mark vertices as removed if they were removed from the graph model
  for (const key in oldVerticesData) {
    const vertexData = oldVerticesData[key];
    if (vertexData && !currentVerticesKeys.has(key) && !vertexData.removed) {
      updatedVerticesData[key] = {
        ...vertexData,
        animationSettings: updateAnimationSettings(
          defaultAnimationSettings,
          currentAnimationsSettings?.[key]
        ),
        removed: true
      };
      isModified = true; // Mark as modified to set the new vertices data object
    }
  }

  // Remove vertices from vertices data if their removal animation is finished
  // and they weren't added back to the graph model
  for (const key of removedVertices) {
    const vertexData = updatedVerticesData[key];
    if (vertexData) cancelVertexAnimations(vertexData);
    delete updatedVerticesData[key];
    removedVertices.delete(key);
    isModified = true; // Mark as modified to set the new vertices data object
  }

  return isModified ? updatedVerticesData : oldVerticesData;
};

const updateGraphEdgesData = <V, E>(
  oldEdgesData: Record<string, EdgeComponentData<E>>,
  currentEdges: OrderedEdges<V, E>,
  verticesData: Record<string, VertexComponentData<V>>,
  removedEdges: Set<string>,
  currentAnimationsSettings: Record<string, Maybe<AnimationSettings>> | null,
  defaultAnimationSettings: AllAnimationSettings | null
): Record<string, EdgeComponentData<E>> => {
  const updatedEdgesData = { ...oldEdgesData };
  let isModified = false; // Flag to indicate if edges data was updated

  // Add new edges to edges data
  for (const edgeData of currentEdges) {
    // Remove edge from the removed edges set if it is in graph
    if (removedEdges.has(edgeData.edge.key)) {
      removedEdges.delete(edgeData.edge.key);
    }

    const oldEdge = oldEdgesData[edgeData.edge.key];

    // Update shared values if they were changed
    if (oldEdge) {
      const oldOrdering = oldEdge.ordering.value;
      if (
        oldOrdering.target.order !== edgeData.order ||
        oldOrdering.target.edgesCount !== edgeData.edgesCount
      ) {
        oldEdge.ordering.value = {
          source: oldOrdering.target,
          target: {
            edgesCount: edgeData.edgesCount,
            order: edgeData.order
          }
        };
      }

      // Continue if edge is already in the graph, is not removed and data
      // is not changed
      if (
        !oldEdge.removed &&
        oldEdge.key === edgeData.edge.key &&
        oldEdge.value === edgeData.edge.value &&
        oldEdge.v1Key === edgeData.edge.vertices[0].key &&
        oldEdge.v2Key === edgeData.edge.vertices[1].key &&
        oldEdge.isDirected === edgeData.edge.isDirected()
      ) {
        continue;
      }
    }

    // Continue if vertices of the edge are not rendered yet
    const [v1, v2] = edgeData.edge.vertices;
    const v1Data = verticesData[v1.key];
    const v2Data = verticesData[v2.key];
    if (!v1Data || !v2Data) continue;

    // Create the edge data
    updatedEdgesData[edgeData.edge.key] = {
      ...(oldEdge ?? {
        // Create shared values only for new edges
        animationProgress: makeMutable(0),
        label: {
          transform: makeMutable({
            center: { x: 0, y: 0 },
            p1: { x: 0, y: 0 },
            p2: { x: 0, y: 0 },
            scale: 0
          })
        },
        ordering: makeMutable({
          source: {
            edgesCount: 0,
            order: 0
          },
          target: {
            edgesCount: edgeData.edgesCount,
            order: edgeData.order
          }
        }),
        points: makeMutable({
          v1Source: getVertexPosition(v1Data),
          v1Target: v1Data.points.value.target,
          v2Source: getVertexPosition(v2Data),
          v2Target: v2Data.points.value.target
        }),
        transformProgress: makeMutable(1)
      }),
      animationSettings: updateAnimationSettings(
        defaultAnimationSettings,
        currentAnimationsSettings &&
          currentAnimationsSettings[edgeData.edge.key]
      ),
      isDirected: edgeData.edge.isDirected(),
      key: edgeData.edge.key,
      removed: false,
      v1Key: v1.key,
      v2Key: v2.key,
      value: edgeData.edge.value
    };
    isModified = true; // Mark as modified to set the new edges data object
  }

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(currentEdges.map(e => e.edge.key));

  // Mark edges as removed if there were removed from the graph model
  for (const key in oldEdgesData) {
    const edgeData = oldEdgesData[key];
    if (edgeData && !currentEdgesKeys.has(key)) {
      if (!edgeData.removed) {
        updatedEdgesData[key] = {
          ...edgeData,
          animationSettings: updateAnimationSettings(
            defaultAnimationSettings,
            currentAnimationsSettings && currentAnimationsSettings[key]
          ),
          removed: true
        };
        isModified = true; // Mark as modified to set the new edges data object
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
    isModified = true; // Mark as modified to set the new edges data object
  }

  return isModified ? updatedEdgesData : oldEdgesData;
};

const updateGraphEdgeLabelsData = <E>(
  oldEdgeLabelsData: Record<string, EdgeLabelComponentData<E>>,
  edgesData: Record<string, EdgeComponentData<E>>
): Record<string, EdgeLabelComponentData<E>> => {
  const updatedEdgeLabelsData = { ...oldEdgeLabelsData };
  let isModified = false; // Flag to indicate if edges data was updated

  // Add new labels data
  for (const key in edgesData) {
    const edgeData = edgesData[key];
    const oldLabelData = oldEdgeLabelsData[key];
    // Update label data if it is not rendered yet or its value was changed
    if (edgeData && (!oldLabelData || oldLabelData.value !== edgeData.value)) {
      updatedEdgeLabelsData[key] = {
        ...edgeData.label,
        animationProgress: edgeData.animationProgress,
        value: edgeData.value
      };
      isModified = true; // Mark as modified to set the new labels data object
    }
  }

  // Remove labels data of edges that are no longer displayed
  // (their unmount animation is finished)
  for (const key in oldEdgeLabelsData) {
    if (!edgesData[key]) {
      delete updatedEdgeLabelsData[key];
      isModified = true; // Mark as modified to set the new labels data object
    }
  }

  return isModified ? updatedEdgeLabelsData : oldEdgeLabelsData;
};

const updateGraphVertexLabelsData = <V>(
  oldVertexLabelsData: Record<string, VertexLabelComponentData<V>>,
  verticesData: Record<string, VertexComponentData<V>>
): Record<string, VertexLabelComponentData<V>> => {
  const updatedVertexLabelsData = { ...oldVertexLabelsData };
  let isModified = false; // Flag to indicate if edges data was updated

  // Add new labels data
  for (const key in verticesData) {
    const vertexData = verticesData[key];
    const oldLabelData = oldVertexLabelsData[key];
    // Update label data if it is not rendered yet or its value was changed
    if (
      vertexData &&
      (!oldLabelData || oldLabelData.value !== vertexData.value)
    ) {
      updatedVertexLabelsData[key] = {
        ...vertexData.label,
        animationProgress: vertexData.animationProgress,
        focusProgress: vertexData.focusProgress,
        value: vertexData.value,
        vertexKey: vertexData.key
      };
      isModified = true; // Mark as modified to set the new labels data object
    }
  }

  // Remove labels data of vertices that are no longer displayed
  // (their unmount animation is finished)
  for (const key in oldVertexLabelsData) {
    if (!verticesData[key]) {
      delete updatedVertexLabelsData[key];
      isModified = true; // Mark as modified to set the new labels data object
    }
  }

  return isModified ? updatedVertexLabelsData : oldVertexLabelsData;
};
