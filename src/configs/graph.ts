/* eslint-disable import/no-unused-modules */
import {
  DEFAULT_ANIMATION_SETTINGS,
  DEFAULT_FOCUS_ANIMATION_SETTINGS
} from '@/constants/animations';
import { CurvedEdgeRenderer } from '@/types/components';
import { Graph } from '@/types/models';
import {
  AllDirectedGraphSettings,
  AllEdgeSettings,
  AllFocusSettings,
  AllGraphLayoutSettings,
  AllGraphPlacementSettings,
  AllRandomPlacementSettings,
  AllUndirectedGraphSettings,
  EdgeType,
  GraphSettings,
  LayoutType,
  PlacementStrategy,
  RandomMeshType
} from '@/types/settings';

/*
 * SETTINGS
 */
export const DEFAULT_EDGE_SETTINGS: Record<EdgeType, AllEdgeSettings> = {
  curved: {
    type: 'curved'
  },
  straight: {
    maxOffsetFactor: 0.5,
    type: 'straight'
  }
};

export const DEFAULT_RANDOM_PLACEMENT_SETTINGS: Record<
  RandomMeshType,
  AllRandomPlacementSettings
> = {
  grid: {
    density: 0.5,
    mesh: 'grid',
    minVertexSpacing: 20,
    strategy: 'random'
  },
  random: {
    mesh: 'random',
    strategy: 'random'
  },
  triangular: {
    density: 0.5,
    mesh: 'triangular',
    minVertexSpacing: 20,
    strategy: 'random'
  }
};

const sharedCircularPlacementSettings = {
  minVertexSpacing: 20,
  sortComparator: (key1: string, key2: string) => {
    'worklet';
    return key1.localeCompare(key2);
  },
  sortVertices: false
};

const sharedRootsPlacementSettings = {
  minVertexSpacing: 20,
  roots: []
};

export const DEFAULT_PLACEMENT_SETTINGS: Record<
  PlacementStrategy,
  AllGraphPlacementSettings
> = {
  circle: {
    ...sharedCircularPlacementSettings,
    strategy: 'circle'
  },
  circles: {
    ...sharedCircularPlacementSettings,
    strategy: 'circles'
  },
  orbits: {
    ...sharedRootsPlacementSettings,
    layerSizing: 'auto',
    maxSectorAngle: (2 / 3) * Math.PI,
    strategy: 'orbits',
    symmetrical: true
  },
  random: DEFAULT_RANDOM_PLACEMENT_SETTINGS.grid,
  trees: {
    ...sharedRootsPlacementSettings,
    strategy: 'trees'
  }
};

export const DEFAULT_LAYOUT_SETTINGS: Record<
  LayoutType,
  AllGraphLayoutSettings
> = {
  auto: {
    type: 'auto'
  },
  force: {
    attractionForceFactor: 1,
    attractionScale: 1,
    repulsionScale: 100000,
    strategy: 'default',
    type: 'force'
  }
};

export const DEFAULT_FOCUS_SETTINGS: AllFocusSettings = {
  alignment: {
    horizontalAlignment: 'center',
    horizontalOffset: 0,
    verticalAlignment: 'center',
    verticalOffset: 0
  },
  animation: DEFAULT_FOCUS_ANIMATION_SETTINGS,
  disableGestures: false,
  vertexScale: 4
};

export const DEFAULT_UNDIRECTED_GRAPH_SETTINGS: AllUndirectedGraphSettings<unknown> =
  {
    // ANIMATION SETTINGS
    animations: {
      edges: DEFAULT_ANIMATION_SETTINGS,
      layout: DEFAULT_ANIMATION_SETTINGS,
      vertices: DEFAULT_ANIMATION_SETTINGS
    },
    // GRAPH COMPONENTS SETTINGS
    components: {
      edge: DEFAULT_EDGE_SETTINGS.straight,
      label: {
        scale: 0.75
      },
      vertex: {
        radius: 20
      }
    },
    // LAYOUT SETTINGS
    layout: DEFAULT_LAYOUT_SETTINGS.auto,
    // PLACEMENT STRATEGIES SETTINGS
    placement: DEFAULT_PLACEMENT_SETTINGS.random
  };

export const DEFAULT_DIRECTED_GRAPH_SETTINGS: AllDirectedGraphSettings<unknown> =
  {
    ...DEFAULT_UNDIRECTED_GRAPH_SETTINGS,
    components: {
      ...DEFAULT_UNDIRECTED_GRAPH_SETTINGS.components,
      arrow: {
        scale: 0.5
      }
    }
  };

/*
 * RENDERERS
 */
export const DEFAULT_EDGE_RENDERERS: {
  curved: CurvedEdgeRenderer<unknown>;
  straight: CurvedEdgeRenderer<unknown>;
} = {
  curved: DefaultCurvedEdgeRenderer,
  straight: DefaultStraightEdgeRenderer
};

export const DEFAULT_EDGE_LABEL_RENDERERS: LabelRenderer<unknown> =
  DefaultEdgeLabelRenderer;

export const getDefaultGraphRenderers = <V, E>(
  graph: Graph<V, E>
  settings?: GraphSettings<V>
): GraphRenderersWithDefaults<V, E> => ({
  arrow: DefaultEdgeArrowRenderer,
  edge: DEFAULT_EDGE_RENDERERS[
    settings?.components?.edge?.type ??
      DEFAULT_GRAPH_SETTINGS.components.edge.type
  ],
  label: undefined, // Label is not rendered by default
  vertex: DefaultVertexRenderer
});
