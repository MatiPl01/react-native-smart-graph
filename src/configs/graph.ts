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
  AllRandomPlacementSettings,
  AllStraightEdgeSettings,
  AllTreesPlacementSettings,
  AllUnboundRandomPlacementSettings,
  AllVertexSettings,
  LayoutType
} from '@/types/settings';
import { unsharedify } from '@/utils/objects';

/*
 * SETTINGS
 */
// PLACEMENT
const minVertexDistance = 20;

const sharedCircularPlacementSettings = {
  minVertexDistance,
  sortComparator: (key1: string, key2: string) => {
    'worklet';
    return key1.localeCompare(key2);
  },
  sortVertices: false
};

const DEFAULT_PLACEMENT_SETTINGS: {
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
    layerSizing: 'auto',
    maxSectorAngle: (2 / 3) * Math.PI,
    minVertexDistance,
    roots: [],
    strategy: 'orbits',
    symmetrical: true
  },
  random: {
    grid: {
      density: 0.5,
      mesh: 'grid',
      minVertexDistance,
      strategy: 'random'
    },
    random: {
      mesh: 'random',
      strategy: 'random'
    },
    triangular: {
      density: 0.5,
      mesh: 'triangular',
      minVertexDistance,
      strategy: 'random'
    }
  },
  trees: {
    minColumnDistance: minVertexDistance,
    minRowDistance: 2 * minVertexDistance,
    roots: [],
    strategy: 'trees'
  }
};

// LAYOUT
const DEFAULT_LAYOUT_SETTINGS: Record<LayoutType, AllGraphLayoutSettings> = {
  auto: {
    type: 'auto'
  },
  force: {
    attractionForceFactor: 1,
    attractionScale: 1,
    minUpdateDistance: 1,
    refreshInterval: 100,
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
const DEFAULT_COMPONENTS_SETTINGS: {
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
    radius: 20,
    scale: 1
  }
};

// ANIMATIONS
const getDefaultAnimations = <V, E>(
  settings: GraphData<V, E>['settings']
): AllGraphAnimationsSettings =>
  settings?.animations === null
    ? {
        edges: null,
        layout: null,
        vertices: null
      }
    : {
        edges:
          settings?.animations?.edges === null
            ? null
            : DEFAULT_ANIMATION_SETTINGS,
        layout:
          settings?.animations?.layout === null
            ? null
            : DEFAULT_ANIMATION_SETTINGS,
        vertices:
          settings?.animations?.vertices === null
            ? null
            : DEFAULT_ANIMATION_SETTINGS
      };

export const getDefaultConfig = <V, E>(
  data: GraphData<V, E>
): Omit<AllGraphSettings<V, E>, 'graph'> => {
  const settings = unsharedify(data?.settings);

  return {
    renderers: {
      arrow: data.graph.isDirected() ? DefaultArrowRenderer : undefined,
      edge:
        settings?.components?.edge?.type === 'curved'
          ? DefaultCurvedEdgeRenderer
          : DefaultStraightEdgeRenderer,
      label: data.settings?.components?.label?.displayed
        ? DefaultLabelRenderer
        : undefined,
      vertex: DefaultVertexRenderer
    },
    settings: {
      animations: getDefaultAnimations(data.settings),
      components: {
        arrow: data.graph.isDirected()
          ? DEFAULT_COMPONENTS_SETTINGS.arrow
          : undefined,
        edge: DEFAULT_COMPONENTS_SETTINGS.edge[
          settings?.components?.edge?.type ?? 'straight'
        ],
        label: DEFAULT_COMPONENTS_SETTINGS.label,
        vertex: DEFAULT_COMPONENTS_SETTINGS.vertex
      },
      events: settings.events && {
        press: settings.events?.press && {
          disableAnimation: false
        }
      },
      layout: settings?.layout
        ? DEFAULT_LAYOUT_SETTINGS[settings.layout.type]
        : DEFAULT_LAYOUT_SETTINGS.auto,
      placement: settings?.placement?.strategy
        ? settings.placement.strategy === 'random'
          ? DEFAULT_PLACEMENT_SETTINGS[settings.placement.strategy][
              settings.placement.mesh ?? 'grid'
            ]
          : DEFAULT_PLACEMENT_SETTINGS[settings.placement.strategy]
        : DEFAULT_PLACEMENT_SETTINGS.random.grid
    }
  };
};

const getPlacementConfig = <V, E>(
  settings: AllGraphSettings<V, E>['settings']
) => {
  const sharedSettings = { strategy: 'shared' };

  switch (settings.placement.strategy) {
    default:
    case 'random':
      const sharedRandomSettings = {
        ...sharedSettings,
        mesh: 'shared'
      };

      switch ((settings.placement as AllRandomPlacementSettings).mesh) {
        case 'grid':
        case 'triangular':
          return {
            ...sharedRandomSettings,
            density: 'shared',
            minVertexDistance: 'shared'
          };
        case 'random':
        default:
          return {
            ...sharedRandomSettings,
            containerHeight: 'shared',
            containerWidth: 'shared'
          };
      }
    case 'circle':
    case 'circles':
      return {
        ...sharedSettings,
        minVertexDistance: 'shared',
        sortVertices: 'shared'
      };
    case 'trees':
      return {
        ...sharedSettings,
        minColumnDistance: 'shared',
        minRowDistance: 'shared',
        roots: 'shared'
      };
    case 'orbits':
      return {
        ...sharedSettings,
        layerSizing: 'shared',
        maxSectorAngle: 'shared',
        minVertexDistance: 'shared',
        roots: 'shared',
        symmetrical: 'shared'
      };
  }
};

export const getUpdateConfig = <V, E>({
  settings
}: Omit<AllGraphSettings<V, E>, 'graph'>) => ({
  graph: 'shallow',
  settings: {
    components: {
      arrow: {
        scale: 'shared'
      },
      edge:
        settings.components.edge.type === 'straight'
          ? {
              // STRAIGHT EDGE PROPERTIES
              maxOffsetFactor: 'shared'
            }
          : undefined,
      label: {
        displayed: 'shared',
        scale: 'shared'
      },
      vertex: {
        scale: 'shared'
      }
    },
    events: settings.events && {
      press: settings.events.press && {
        disableAnimation: 'shared'
      }
    },
    focus: {
      disableGestures: 'shared',
      points: 'shared',
      progress: 'shared'
    },
    layout:
      settings.layout.type === 'force'
        ? {
            // FORCE LAYOUT PROPERTIES
            attractionForceFactor: 'shared',
            attractionScale: 'shared',
            minUpdateDistance: 'shared',
            refreshInterval: 'shared',
            repulsionScale: 'shared',
            strategy: 'shared'
          }
        : undefined,
    placement: getPlacementConfig(settings)
  }
});
