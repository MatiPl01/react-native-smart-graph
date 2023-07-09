import DefaultEdgeArrowRenderer from '@/components/graphs/arrows/renderers/DefaultEdgeArrowRenderer';
import DefaultCurvedEdgeRenderer from '@/components/graphs/edges/curved/renderers/DefaultCurvedEdgeRenderer';
import DefaultStraightEdgeRenderer from '@/components/graphs/edges/straight/renderers/DefaultStraightEdgeRenderer';
import DefaultVertexRenderer from '@/components/graphs/vertices/renderers/DefaultVertexRenderer';
import {
  DEFAULT_ANIMATION_SETTINGS,
  DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS
} from '@/constants/animations';
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
  EdgeComponentRenderData,
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { OrderedEdges, Vertex } from '@/types/graphs';
import {
  EdgeLabelRendererFunction,
  GraphRenderers,
  GraphRenderersWithDefaults
} from '@/types/renderer';
import {
  DirectedEdgeSettings,
  GraphSettings,
  GraphSettingsWithDefaults
} from '@/types/settings';
import {
  AnimationSettingsWithDefaults,
  AnimationsSettings
} from '@/types/settings/animations';
import {
  GraphLayoutSettings,
  GraphLayoutSettingsWithDefaults
} from '@/types/settings/graph/layout';

export const updateGraphSettingsWithDefaults = <V, E>(
  isGraphDirected: boolean,
  settings?: GraphSettings<V, E>
): GraphSettingsWithDefaults<V, E> => ({
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
        animationSettings: {
          ...settings.animations.vertices,
          ...currentAnimationsSettings.vertices[vertex.key]
        } as unknown as AnimationSettingsWithDefaults,
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
        } as unknown as AnimationSettingsWithDefaults,
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
  settings: GraphSettingsWithDefaults<V, E>,
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
        } as unknown as AnimationSettingsWithDefaults,
        arrowRenderer: renderers.arrow,
        componentSettings: settings.components.edge,
        edge,
        edgeRenderer: renderers.edge,
        edgesCount,
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
        } as unknown as AnimationSettingsWithDefaults,
        removed: true
      };
    }
  });

  return {
    data: updatedEdgesData,
    wasUpdated
  };
};

export const updateGraphEdgeLabelsData = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  oldEdgeLabelsData: Record<string, EdgeLabelComponentData<E>>,
  edgesData: Record<string, EdgeComponentData<E, V, ED>>,
  renderedEdgesData: Record<string, EdgeComponentRenderData>,
  labelRenderer: EdgeLabelRendererFunction<E>
): {
  data: Record<string, EdgeLabelComponentData<E>>;
  wasUpdated: boolean;
} => {
  const updatedEdgeLabelsData = { ...oldEdgeLabelsData };
  let wasUpdated = false; // Flag to indicate if edges data was updated

  // Add new labels data
  Object.entries(renderedEdgesData).forEach(([key, data]) => {
    const edgeData = edgesData[key];

    if (!updatedEdgeLabelsData[key] && edgeData) {
      wasUpdated = true;
      updatedEdgeLabelsData[key] = {
        animationProgress: data.animationProgress,
        centerX: data.labelPosition.x,
        centerY: data.labelPosition.y,
        height: data.labelHeight,
        renderer: labelRenderer,
        v1Position: edgeData.v1Position,
        v2Position: edgeData.v2Position,
        value: edgeData.edge.value
      };
    }
  });

  // Keys of edges that are currently in the graph
  const currentEdgesKeys = new Set(Object.keys(renderedEdgesData));

  // Remove labels data of edges that are no longer displayed
  // (their unmount animation is finished)
  Object.keys(oldEdgeLabelsData).forEach(key => {
    if (!currentEdgesKeys.has(key)) {
      wasUpdated = true;
      delete updatedEdgeLabelsData[key];
    }
  });

  return {
    data: updatedEdgeLabelsData,
    wasUpdated
  };
};
