import {
  DefaultArrowRenderer,
  DefaultCurvedEdgeRenderer,
  DefaultLabelRenderer,
  DefaultStraightEdgeRenderer,
  DefaultVertexRenderer
} from '@/components';
import {
  DEFAULT_ANIMATION_SETTINGS,
  DEFAULT_FOCUS_ANIMATION_SETTINGS
} from '@/constants/animations';
import { AllGraphSettings } from '@/types/components';
import { GraphData } from '@/types/data';
import {
  AllArrowSettings,
  AllBoundRandomPlacementSettings,
  AllCirclePlacementSettings,
  AllCirclesPlacementSettings,
  AllCurvedEdgeSettings,
  AllFocusSettings,
  AllGraphAnimationsSettings,
  AllGraphLayoutSettings,
  AllLabelSettings,
  AllOrbitsPlacementSettings,
  AllStraightEdgeSettings,
  AllTreesPlacementSettings,
  AllUnboundRandomPlacementSettings,
  AllVertexSettings,
  LayoutType
} from '@/types/settings';

/*
 * SETTINGS
 */
// PLACEMENT
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

export const DEFAULT_PLACEMENT_SETTINGS: {
  circle: AllCirclePlacementSettings;
  circles: AllCirclesPlacementSettings;
  orbits: AllOrbitsPlacementSettings;
  random: {
    grid: AllUnboundRandomPlacementSettings;
    random: AllBoundRandomPlacementSettings;
    triangular: AllUnboundRandomPlacementSettings;
  };
  trees: AllTreesPlacementSettings;
} = {
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
  random: {
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
  },
  trees: {
    ...sharedRootsPlacementSettings,
    strategy: 'trees'
  }
};

// LAYOUT
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

// FOCUS
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

// COMPONENTS
export const DEFAULT_COMPONENTS_SETTINGS: {
  arrow: AllArrowSettings;
  edge: {
    curved: AllCurvedEdgeSettings;
    straight: AllStraightEdgeSettings;
  };
  label: AllLabelSettings;
  vertex: AllVertexSettings;
} = {
  arrow: {
    scale: 0.5
  },
  edge: {
    curved: {
      type: 'curved'
    },
    straight: {
      maxOffsetFactor: 0.5,
      type: 'straight'
    }
  },
  label: {
    displayed: false,
    scale: 0.5
  },
  vertex: {
    radius: 20
  }
};

// ANIMATIONS
const DEFAULT_ANIMATIONS_SETTINGS: AllGraphAnimationsSettings = {
  edges: DEFAULT_ANIMATION_SETTINGS,
  layout: DEFAULT_ANIMATION_SETTINGS,
  vertices: DEFAULT_ANIMATION_SETTINGS
};

export const getDefaultConfig = <V, E>(
  data: GraphData<V, E>
): Omit<AllGraphSettings<V, E>, 'graph'> => ({
  renderers: {
    arrow: data.graph.isDirected() ? DefaultArrowRenderer : undefined,
    edge:
      data.settings?.components?.edge?.type === 'curved'
        ? DefaultCurvedEdgeRenderer
        : DefaultStraightEdgeRenderer,
    label: data.settings?.components?.label?.displayed
      ? DefaultLabelRenderer
      : undefined,
    vertex: DefaultVertexRenderer
  },
  settings: {
    animations: DEFAULT_ANIMATIONS_SETTINGS,
    components: {
      arrow: data.graph.isDirected()
        ? DEFAULT_COMPONENTS_SETTINGS.arrow
        : undefined,
      edge: DEFAULT_COMPONENTS_SETTINGS.edge[
        data.settings?.components?.edge?.type ?? 'straight'
      ],
      label: DEFAULT_COMPONENTS_SETTINGS.label,
      vertex: DEFAULT_COMPONENTS_SETTINGS.vertex
    },
    layout: data.settings?.layout
      ? DEFAULT_LAYOUT_SETTINGS[data.settings.layout.type]
      : DEFAULT_LAYOUT_SETTINGS.auto,
    placement: data.settings?.placement
      ? data.settings.placement.strategy === 'random'
        ? DEFAULT_PLACEMENT_SETTINGS[data.settings.placement.strategy][
            data.settings.placement.mesh ?? 'grid'
          ]
        : DEFAULT_PLACEMENT_SETTINGS[data.settings.placement.strategy]
      : DEFAULT_PLACEMENT_SETTINGS.random.grid
  }
});
