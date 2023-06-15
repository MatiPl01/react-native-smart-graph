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
import { DEFAULT_FORCES_STRATEGY_SETTINGS } from '@/constants/forces';
import { RANDOM_PLACEMENT_SETTING } from '@/constants/placement';
import { EdgeComponentData, VertexComponentData } from '@/types/components';
import { OrderedEdges, Vertex } from '@/types/graphs';
import { GraphRenderers, GraphRenderersWithDefaults } from '@/types/renderer';
import {
  DirectedEdgeSettings,
  GraphSettings,
  GraphSettingsWithDefaults,
  RandomPlacementSettings
} from '@/types/settings';
import { AnimationsSettings } from '@/types/settings/animations';
import {
  GraphLayoutSettings,
  GraphLayoutSettingsWithDefaults
} from '@/types/settings/graph/layout';

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
  },
  layout: updateGraphLayoutSettingsWithDefaults(settings?.layout)
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
  oldVerticesData: Record<string, VertexComponentData<V, E>>,
  currentVertices: Array<Vertex<V, E>>,
  currentAnimationsSettings: AnimationsSettings,
  settings: GraphSettingsWithDefaults<V, E>,
  renderers: GraphRenderersWithDefaults<V, E>
): Record<string, VertexComponentData<V, E>> => {
  const updatedVerticesData = { ...oldVerticesData };

  // Add new vertices
  currentVertices.forEach(vertex => {
    if (!oldVerticesData[vertex.key] || oldVerticesData[vertex.key]?.removed) {
      updatedVerticesData[vertex.key] = {
        vertex,
        componentSettings: settings.components.vertex,
        animationSettings: {
          ...settings.animations.vertices,
          ...currentAnimationsSettings.vertices[vertex.key]
        },
        removed: false,
        renderer: renderers.vertex
      };
    }
  });

  // Keys of vertices that are currently in the graph
  const currentVerticesKeys = new Set(currentVertices.map(v => v.key));

  // Mark vertices as removed if there were removed from the graph model
  Object.keys(oldVerticesData).forEach(key => {
    if (!currentVerticesKeys.has(key)) {
      updatedVerticesData[key] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...updatedVerticesData[key]!,
        removed: true,
        animationSettings: {
          ...settings.animations.vertices,
          ...currentAnimationsSettings.vertices[key]
        }
      };
    }
  });

  return updatedVerticesData;
};

export const updateGraphEdgesData = <V, E>(
  oldEdgesData: Record<string, EdgeComponentData<E, V>>,
  currentEdges: OrderedEdges<E, V>,
  currentAnimationsSettings: AnimationsSettings,
  settings: GraphSettingsWithDefaults<V, E>,
  renderers: GraphRenderersWithDefaults<V, E>
): Record<string, EdgeComponentData<E, V>> => {
  const updatedEdgesData = { ...oldEdgesData };

  // Add new edges to edges data
  currentEdges.forEach(({ edge, order, edgesCount }) => {
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
        componentSettings: settings.components.edge,
        edgeRenderer: renderers.edge,
        arrowRenderer: renderers.arrow,
        labelRenderer: renderers.label,
        animationSettings: {
          ...settings.animations.edges,
          ...currentAnimationsSettings.edges[edge.key]
        }
      };
    }
  });

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(currentEdges.map(e => e.edge.key));

  // Mark edges as removed if there were removed from the graph model
  Object.keys(currentEdgesKeys).forEach(key => {
    if (!currentEdgesKeys.has(key)) {
      updatedEdgesData[key] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...updatedEdgesData[key]!,
        removed: true,
        animationSettings: {
          ...settings.animations.edges,
          ...currentAnimationsSettings.edges[key]
        }
      };
    }
  });

  return updatedEdgesData;
};
