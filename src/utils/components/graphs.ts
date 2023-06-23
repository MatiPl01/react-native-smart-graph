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
import { RANDOM_PLACEMENT_SETTINGS } from '@/constants/placement';
import {
  EdgeComponentData,
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { OrderedEdges, Vertex } from '@/types/graphs';
import { GraphRenderers, GraphRenderersWithDefaults } from '@/types/renderer';
import {
  DirectedEdgeSettings,
  GraphSettings,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { AnimationsSettings } from '@/types/settings/animations';
import {
  GraphLayoutSettings,
  GraphLayoutSettingsWithDefaults
} from '@/types/settings/graph/layout';

export const updateGraphSettingsWithDefaults = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  isGraphDirected: boolean,
  settings?: GraphSettings<V, E, ED>
): GraphSettingsWithDefaults<V, E, ED> => ({
  ...settings,
  animations: {
    edges: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.edges
    },
    layout: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.layout
    },
    vertices: {
      ...DEFAULT_ANIMATION_SETTINGS,
      ...settings?.animations?.vertices
    }
  },
  components: {
    ...settings?.components,
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
    },
    vertex: {
      ...VERTEX_COMPONENT_SETTINGS,
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

export const updateGraphVerticesData = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  oldVerticesData: Record<string, VertexComponentData<V, E>>,
  currentVertices: Array<Vertex<V, E>>,
  currentAnimationsSettings: AnimationsSettings,
  settings: GraphSettingsWithDefaults<V, E, ED>,
  renderers: GraphRenderersWithDefaults<V, E>
): Record<string, VertexComponentData<V, E>> => {
  const updatedVerticesData = { ...oldVerticesData };

  // Add new vertices
  currentVertices.forEach(vertex => {
    if (!oldVerticesData[vertex.key] || oldVerticesData[vertex.key]?.removed) {
      updatedVerticesData[vertex.key] = {
        animationSettings: {
          ...settings.animations.vertices,
          ...currentAnimationsSettings.vertices[vertex.key]
        },
        componentSettings: settings.components.vertex,
        removed: false,
        renderer: renderers.vertex,
        vertex
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
        animationSettings: {
          ...settings.animations.vertices,
          ...currentAnimationsSettings.vertices[key]
        },
        removed: true
      };
    }
  });

  return updatedVerticesData;
};

export const updateGraphEdgesData = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  oldEdgesData: Record<string, EdgeComponentData<E, V, ED>>,
  currentEdges: OrderedEdges<E, V>,
  renderedVerticesData: Record<string, VertexComponentRenderData>,
  currentAnimationsSettings: AnimationsSettings,
  settings: GraphSettingsWithDefaults<V, E, ED>,
  renderers: GraphRenderersWithDefaults<V, E>
): {
  data: Record<string, EdgeComponentData<E, V, ED>>;
  wasUpdated: boolean;
} => {
  const updatedEdgesData = { ...oldEdgesData };
  let wasUpdated = false; // Flag to indicate if edges data was updated

  // Add new edges to edges data
  currentEdges.forEach(({ edge, edgesCount, order }) => {
    const [v1, v2] = edge.vertices;
    const v1Data = renderedVerticesData[v1.key];
    const v2Data = renderedVerticesData[v2.key];

    if (
      v1Data &&
      v2Data &&
      (!updatedEdgesData[edge.key] ||
        updatedEdgesData[edge.key]?.removed ||
        updatedEdgesData[edge.key]?.edgesCount !== edgesCount)
    ) {
      wasUpdated = true;
      updatedEdgesData[edge.key] = {
        animationSettings: {
          ...settings.animations.edges,
          ...currentAnimationsSettings.edges[edge.key]
        },
        arrowRenderer: renderers.arrow,
        componentSettings: settings.components.edge,
        edge,
        edgeRenderer: renderers.edge,
        edgesCount,
        labelRenderer: renderers.label,
        order,
        removed: false,
        v1Position: v1Data.position,
        v1Radius: v1Data.currentRadius,
        v2Position: v2Data.position,
        v2Radius: v2Data.currentRadius
      };
    }
  });

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(currentEdges.map(e => e.edge.key));

  // Mark edges as removed if there were removed from the graph model
  Object.keys(oldEdgesData).forEach(key => {
    if (!currentEdgesKeys.has(key)) {
      wasUpdated = true;
      updatedEdgesData[key] = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...updatedEdgesData[key]!,
        animationSettings: {
          ...settings.animations.edges,
          ...currentAnimationsSettings.edges[key]
        },
        removed: true
      };
    }
  });

  return {
    data: updatedEdgesData,
    wasUpdated
  };
};
