/* eslint-disable import/no-unused-modules */
import { DEFAULT_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  EdgeLabelRendererFunction,
  EdgeRenderFunction,
  GraphRenderersWithDefaults
} from '@/types/renderers';
import {
  EdgeSettingsWithDefaults,
  EdgeType,
  GraphLayoutSettingsWithDefaults,
  GraphPlacementSettingsWithDefaults,
  GraphSettings,
  GraphSettingsWithDefaults,
  LayoutType,
  PlacementStrategy,
  RandomMeshType,
  RandomPlacementSettingsWithDefaults
} from '@/types/settings';

import {
  DefaultCurvedEdgeRenderer,
  DefaultEdgeArrowRenderer,
  DefaultEdgeLabelRenderer,
  DefaultStraightEdgeRenderer,
  DefaultVertexRenderer
} from '..';

/*
 * SETTINGS
 */
export const DEFAULT_EDGE_SETTINGS: Record<EdgeType, EdgeSettingsWithDefaults> =
  {
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
  RandomPlacementSettingsWithDefaults
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
  GraphPlacementSettingsWithDefaults
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
  GraphLayoutSettingsWithDefaults
> = {
  auto: {
    type: 'auto'
  },
  forces: {
    settings: {
      attractionForceFactor: 1,
      attractionScale: 1,
      repulsionScale: 100000,
      strategy: 'default'
    },
    type: 'forces'
  }
};

export const DEFAULT_GRAPH_SETTINGS: GraphSettingsWithDefaults<unknown> = {
  // ANIMATION SETTINGS
  animations: {
    edges: DEFAULT_ANIMATION_SETTINGS,
    layout: DEFAULT_ANIMATION_SETTINGS,
    vertices: DEFAULT_ANIMATION_SETTINGS
  },
  // GRAPH COMPONENTS SETTINGS
  components: {
    arrow: {
      scale: 0.5
    },
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

/*
 * RENDERERS
 */
export const DEFAULT_EDGE_RENDERERS: Record<
  EdgeType,
  EdgeRenderFunction<unknown>
> = {
  curved: DefaultCurvedEdgeRenderer,
  straight: DefaultStraightEdgeRenderer
};

export const DEFAULT_EDGE_LABEL_RENDERERS: EdgeLabelRendererFunction<unknown> =
  DefaultEdgeLabelRenderer;

export const getDefaultGraphRenderers = <V, E>(
  settings: GraphSettings<V>
): GraphRenderersWithDefaults<V, E> => ({
  arrow: DefaultEdgeArrowRenderer,
  edge: DEFAULT_EDGE_RENDERERS[
    settings.components?.edge?.type ??
      DEFAULT_GRAPH_SETTINGS.components.edge.type
  ],
  label: undefined, // Label is not rendered by default
  vertex: DefaultVertexRenderer
});
