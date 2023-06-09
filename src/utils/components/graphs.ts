import DefaultEdgeArrowRenderer from '@/components/graphs/arrows/renderers/DefaultEdgeArrowRenderer';
import DefaultCurvedEdgeRenderer from '@/components/graphs/edges/curved/renderers/DefaultCurvedEdgeRenderer';
import DefaultStraightEdgeRenderer from '@/components/graphs/edges/straight/renderers/DefaultStraightEdgeRenderer';
import DefaultVertexRenderer from '@/components/graphs/vertices/renderers/DefaultVertexRenderer';
import { DEFAULT_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  ARROW_COMPONENT_SETTINGS,
  CURVED_EDGE_COMPONENT_SETTINGS,
  LABEL_COMPONENT_SETTINGS,
  STRAIGHT_EDGE_COMPONENT_SETTINGS,
  VERTEX_COMPONENT_SETTINGS
} from '@/constants/components';
import { RANDOM_PLACEMENT_SETTING } from '@/constants/placement';
import { GraphData, GraphEdgeData, GraphVertexData } from '@/types/components';
import { GraphRenderers, GraphRenderersWithDefaults } from '@/types/renderer';
import {
  DirectedEdgeSettings,
  GraphSettings,
  GraphSettingsWithDefaults,
  RandomPlacementSettings
} from '@/types/settings';

export const updateGraphSettingsWithDefaults = <V, E>(
  isGraphDirected: boolean,
  settings?: GraphSettings<V, E>
): GraphSettingsWithDefaults<V, E> => ({
  ...settings,
  placement: {
    ...(RANDOM_PLACEMENT_SETTING as RandomPlacementSettings),
    ...settings?.placement
  },
  components: {
    ...settings?.components,
    vertex: {
      ...VERTEX_COMPONENT_SETTINGS,
      ...settings?.components?.vertex
    },
    edge: {
      ...(settings?.components?.edge?.type === 'straight'
        ? STRAIGHT_EDGE_COMPONENT_SETTINGS
        : CURVED_EDGE_COMPONENT_SETTINGS),
      ...settings?.components?.edge,
      ...(isGraphDirected
        ? {
            arrow: {
              ...ARROW_COMPONENT_SETTINGS,
              ...(settings?.components?.edge as DirectedEdgeSettings)?.arrow
            }
          }
        : {}),

      label: {
        ...LABEL_COMPONENT_SETTINGS,
        ...settings?.components?.edge?.label
      }
    }
  },
  animations: {
    layout: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.layout
    },
    vertices: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.vertices
    },
    edges: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.edges
    }
  }
});

export const updateGraphRenderersWithDefaults = <V, E>(
  isGraphDirected: boolean,
  edgeType: 'straight' | 'curved',
  renderers?: GraphRenderers<V, E>
): GraphRenderersWithDefaults<V, E> => ({
  vertex: DefaultVertexRenderer,
  edge:
    edgeType === 'straight'
      ? DefaultStraightEdgeRenderer
      : DefaultCurvedEdgeRenderer,
  arrow: isGraphDirected ? DefaultEdgeArrowRenderer : undefined,
  ...renderers
});

export const updateGraphVerticesData = <V, E>(
  oldVerticesData: Record<string, GraphVertexData<V, E>>,
  currentGraphData: GraphData<V, E>
): Record<string, GraphVertexData<V, E>> => {
  const updatedVerticesData = { ...oldVerticesData };

  // Add new vertices
  currentGraphData.vertices.forEach(vertex => {
    const targetPlacementPosition =
      currentGraphData.layout.verticesPositions[vertex.key];
    if (
      targetPlacementPosition &&
      (!updatedVerticesData[vertex.key] ||
        updatedVerticesData[vertex.key]?.removed)
    ) {
      updatedVerticesData[vertex.key] = {
        vertex,
        animationSettings: {
          ...currentGraphData.defaultAnimations.vertices,
          ...currentGraphData.animations.vertices[vertex.key]
        },
        targetPlacementPosition,
        removed: false
      };
    }
  });

  // Keys of vertices that are currently in the graph
  const currentVerticesKeys = new Set(Object.keys(currentGraphData.vertices));

  // Mark vertices as removed if there were removed from the graph model
  Object.keys(oldVerticesData).forEach(key => {
    if (currentVerticesKeys.has(key)) {
      updatedVerticesData[key] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...updatedVerticesData[key]!,
        removed: true,
        animationSettings: {
          ...currentGraphData.defaultAnimations.vertices,
          ...currentGraphData.animations.vertices[key]
        }
      };
    }
  });

  return updatedVerticesData;
};

export const updateGraphEdgesData = <V, E>(
  oldEdgesData: Record<string, GraphEdgeData<E, V>>,
  currentGraphData: GraphData<V, E>
): Record<string, GraphEdgeData<E, V>> => {
  const updatedEdgesData = { ...oldEdgesData };

  // Add new edges to edges data
  currentGraphData.orderedEdges.forEach(({ edge, order, edgesCount }) => {
    if (
      !updatedEdgesData[edge.key] ||
      updatedEdgesData[edge.key]?.removed ||
      updatedEdgesData[edge.key]?.edgesCount !== edgesCount
    ) {
      updatedEdgesData[edge.key] = {
        edge,
        order,
        edgesCount,
        removed: false,
        animationSettings: {
          ...currentGraphData.defaultAnimations.edges,
          ...currentGraphData.animations.edges[edge.key]
        }
      };
    }
  });

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(Object.keys(currentGraphData.edges));

  // Mark edges as removed if there were removed from the graph model
  Object.keys(currentEdgesKeys).forEach(key => {
    if (!currentEdgesKeys.has(key)) {
      updatedEdgesData[key] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...updatedEdgesData[key]!,
        removed: true,
        animationSettings: {
          ...currentGraphData.defaultAnimations.edges,
          ...currentGraphData.animations.edges[key]
        }
      };
    }
  });

  return updatedEdgesData;
};
