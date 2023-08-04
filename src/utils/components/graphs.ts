import { makeMutable } from 'react-native-reanimated';

import DefaultEdgeArrowRenderer from '@/components/graphs/arrows/renderers/DefaultEdgeArrowRenderer';
import DefaultCurvedEdgeRenderer from '@/components/graphs/edges/curved/renderers/DefaultCurvedEdgeRenderer';
import DefaultStraightEdgeRenderer from '@/components/graphs/edges/straight/renderers/DefaultStraightEdgeRenderer';
import DefaultVertexRenderer from '@/components/graphs/vertices/renderers/DefaultVertexRenderer';
import {
  DEFAULT_ANIMATION_SETTINGS,
  DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS
} from '@/constants/animations';
import {
  CURVED_EDGE_COMPONENT_SETTINGS,
  DEFAULT_ARROW_COMPONENT_SETTINGS,
  DEFAULT_LABEL_COMPONENT_SETTINGS,
  DEFAULT_STRAIGHT_EDGE_COMPONENT_SETTINGS,
  DEFAULT_VERTEX_COMPONENT_SETTINGS
} from '@/constants/components';
import { DEFAULT_FORCES_STRATEGY_SETTINGS } from '@/constants/forces';
import { RANDOM_PLACEMENT_SETTINGS } from '@/constants/placement';
import { EdgeComponentData, VertexComponentData } from '@/types/components';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { OrderedEdges, Vertex } from '@/types/graphs';
import { GraphRenderers, GraphRenderersWithDefaults } from '@/types/renderer';
import {
  DirectedGraphComponentsSettings,
  GraphSettings,
  GraphSettingsWithDefaults
} from '@/types/settings';
import {
  AnimationSettings,
  AnimationSettingsWithDefaults
} from '@/types/settings/animations';
import {
  GraphLayoutSettings,
  GraphLayoutSettingsWithDefaults
} from '@/types/settings/graph/layout';

export const updateGraphSettingsWithDefaults = <V>(
  isGraphDirected: boolean,
  settings?: GraphSettings<V>
): GraphSettingsWithDefaults<V> => ({
  ...settings,
  animations: {
    edges: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.edges
    } as unknown as AnimationSettingsWithDefaults,
    layout: {
      ...(settings?.layout?.managedBy === 'forces'
        ? DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS
        : DEFAULT_ANIMATION_SETTINGS),
      ...settings?.animations?.layout
    } as unknown as AnimationSettingsWithDefaults,
    vertices: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.vertices
    } as unknown as AnimationSettingsWithDefaults
  },
  components: {
    ...settings?.components,
    edge: {
      ...(settings?.components?.edge?.type === 'curved'
        ? CURVED_EDGE_COMPONENT_SETTINGS
        : DEFAULT_STRAIGHT_EDGE_COMPONENT_SETTINGS),
      ...settings?.components?.edge
    },
    ...(isGraphDirected
      ? {
          arrow: {
            ...DEFAULT_ARROW_COMPONENT_SETTINGS,
            ...(settings?.components as DirectedGraphComponentsSettings)?.arrow
          }
        }
      : {}),
    label: {
      ...DEFAULT_LABEL_COMPONENT_SETTINGS,
      ...settings?.components?.label
    },
    vertex: {
      ...DEFAULT_VERTEX_COMPONENT_SETTINGS,
      ...settings?.components?.vertex
    }
  },
  layout: updateGraphLayoutSettingsWithDefaults(settings?.layout),
  placement: settings?.placement ?? {
    strategy: 'random',
    ...RANDOM_PLACEMENT_SETTINGS
  }
});

const updateGraphLayoutSettingsWithDefaults = (
  settings?: GraphLayoutSettings
): GraphLayoutSettingsWithDefaults => {
  switch (settings?.managedBy) {
    case 'forces':
      return {
        managedBy: 'forces',
        settings: {
          ...DEFAULT_FORCES_STRATEGY_SETTINGS,
          ...settings
        }
      };
    case 'placement':
    default:
      return { managedBy: 'placement', ...settings };
  }
};

export const updateGraphRenderersWithDefaults = <V, E>(
  isGraphDirected: boolean,
  edgeType: 'curved' | 'straight',
  renderers?: GraphRenderers<V, E>
): GraphRenderersWithDefaults<V, E> => ({
  arrow: isGraphDirected ? DefaultEdgeArrowRenderer : undefined,
  edge:
    edgeType === 'straight'
      ? DefaultStraightEdgeRenderer
      : DefaultCurvedEdgeRenderer,
  vertex: DefaultVertexRenderer,
  ...renderers
});

export const updateGraphVerticesData = <V, E>(
  oldVerticesData: Record<string, VertexComponentData<V, E>>,
  currentVertices: Array<Vertex<V, E>>,
  removedVertices: Set<string>,
  currentAnimationsSettings: Record<string, AnimationSettings | undefined>,
  defaultAnimationSettings: AnimationSettingsWithDefaults
): {
  data: Record<string, VertexComponentData<V, E>>;
  shouldRender: boolean;
} => {
  const updatedVerticesData = { ...oldVerticesData };
  let shouldRender = false;

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

    shouldRender = true;
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
    if (vertexData && !currentVerticesKeys.has(key)) {
      if (!vertexData.removed) {
        shouldRender = true;
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
  }

  // Remove vertices from vertices data if theri removeal animation is finished
  // and they weren't added back to the graph model
  for (const key of removedVertices) {
    delete updatedVerticesData[key];
    removedVertices.delete(key);
  }

  return {
    data: updatedVerticesData,
    shouldRender
  };
};

export const updateGraphEdgesData = <V, E>(
  oldEdgesData: Record<string, EdgeComponentData<E, V>>,
  currentEdges: OrderedEdges<E, V>,
  verticesData: Record<string, VertexComponentData<V, E>>,
  removedEdges: Set<string>,
  currentAnimationsSettings: Record<string, AnimationSettings | undefined>,
  defaultAnimationSettings: AnimationSettingsWithDefaults
): {
  data: Record<string, EdgeComponentData<E, V>>;
  shouldRender: boolean;
} => {
  const updatedEdgesData = { ...oldEdgesData };
  let shouldRender = false; // Flag to indicate if edges data was updated

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

    shouldRender = true;
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
        shouldRender = true;
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

  // Remove edges from edges data if their removeal animation is finished
  // and they weren't added back to the graph model
  for (const key of removedEdges) {
    delete updatedEdgesData[key];
    removedEdges.delete(key);
  }

  return {
    data: updatedEdgesData,
    shouldRender
  };
};

export const updateGraphEdgeLabelsData = <V, E>(
  oldEdgeLabelsData: Record<string, EdgeLabelComponentData<E>>,
  edgesData: Record<string, EdgeComponentData<E, V>>
): {
  data: Record<string, EdgeLabelComponentData<E>>;
  shouldRender: boolean;
} => {
  const updatedEdgeLabelsData = { ...oldEdgeLabelsData };
  let shouldRender = false; // Flag to indicate if edges data was updated

  // Add new labels data
  Object.entries(edgesData).forEach(([key, data]) => {
    const edgeData = edgesData[key];

    const oldLabelData = oldEdgeLabelsData[key];

    // Update label data if it is not rendered yet or its value was changed
    if (
      edgeData &&
      (!oldLabelData || oldLabelData.value !== edgeData.edge.value)
    ) {
      shouldRender = true;
      updatedEdgeLabelsData[key] = {
        animationProgress: data.animationProgress,
        centerX: data.labelPosition.x,
        centerY: data.labelPosition.y,
        height: data.labelHeight,
        v1Position: edgeData.v1Position,
        v2Position: edgeData.v2Position,
        value: edgeData.edge.value
      };
    }
  });

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(Object.keys(edgesData));

  // Remove labels data of edges that are no longer displayed
  // (their unmount animation is finished)
  for (const key in oldEdgeLabelsData) {
    if (!currentEdgesKeys.has(key)) {
      shouldRender = true;
      delete updatedEdgeLabelsData[key];
    }
  }

  return {
    data: updatedEdgeLabelsData,
    shouldRender
  };
};
