import {
  DefaultArrowRenderer,
  DefaultCurvedEdgeRenderer,
  DefaultLabelRenderer,
  DefaultStraightEdgeRenderer,
  DefaultVertexMaskRenderer,
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
  AllMultiStepFocusSettings,
  AllOrbitsPlacementSettings,
  AllRandomPlacementSettings,
  AllStraightEdgeSettings,
  AllTreesPlacementSettings,
  AllUnboundRandomPlacementSettings,
  AllVertexSettings,
  LayoutType
} from '@/types/settings';
import { isAnimationSettingsObject } from '@/utils/animations';

/*
 * SETTINGS
 */
// PLACEMENT
const minVertexDistance = 100;

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
    maxSectorAngle: Math.PI,
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
// Single vertex focus
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

// Multi-step vertex focus
const DEFAULT_MULTI_STEP_FOCUS_SETTINGS: Omit<
  AllMultiStepFocusSettings,
  'points' | 'progress'
> = {
  disableGestures: false,
  pointsChangeAnimationSettings: DEFAULT_FOCUS_ANIMATION_SETTINGS
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
    curved: {},
    straight: {
      maxOffsetFactor: 0.5
    }
  },
  label: {
    scale: 0.5
  },
  vertex: {
    radius: 20
  }
};

// ANIMATIONS
const getDefaultAnimations = <V, E>({
  animationSettings
}: GraphData<V, E>): AllGraphAnimationsSettings => {
  if (animationSettings === null) {
    return {
      edges: null,
      layout: null,
      vertices: null
    };
  }

  if (!animationSettings || isAnimationSettingsObject(animationSettings)) {
    return {
      edges: DEFAULT_ANIMATION_SETTINGS,
      layout: DEFAULT_ANIMATION_SETTINGS,
      vertices: DEFAULT_ANIMATION_SETTINGS
    };
  }

  return {
    edges: animationSettings.edges === null ? null : DEFAULT_ANIMATION_SETTINGS,
    layout:
      animationSettings.layout === null ? null : DEFAULT_ANIMATION_SETTINGS,
    vertices:
      animationSettings.vertices === null ? null : DEFAULT_ANIMATION_SETTINGS
  };
};

export const getDefaultConfig = <V, E>(
  data: GraphData<V, E>
): Omit<AllGraphSettings<V, E>, 'graph'> => ({
  animationSettings: getDefaultAnimations(data),
  componentsSettings: {
    arrow: data.graph.isDirected()
      ? DEFAULT_COMPONENTS_SETTINGS.arrow
      : undefined,
    edge: DEFAULT_COMPONENTS_SETTINGS.edge[data.edgeType ?? 'straight'],
    label: DEFAULT_COMPONENTS_SETTINGS.label,
    vertex: DEFAULT_COMPONENTS_SETTINGS.vertex
  },
  edgeType: data.edgeType ?? 'straight',
  eventSettings: data.eventSettings && {
    press: data.eventSettings.press && {
      disableAnimation: false
    }
  },
  focusSettings: data.focusSettings
    ? {
        ...data.focusSettings,
        ...DEFAULT_MULTI_STEP_FOCUS_SETTINGS
      }
    : undefined,
  layoutSettings: data.layoutSettings?.type
    ? DEFAULT_LAYOUT_SETTINGS[data.layoutSettings.type]
    : DEFAULT_LAYOUT_SETTINGS.auto,
  placementSettings: data.placementSettings?.strategy
    ? data.placementSettings?.strategy === 'random'
      ? DEFAULT_PLACEMENT_SETTINGS.random[data.placementSettings.mesh ?? 'grid']
      : DEFAULT_PLACEMENT_SETTINGS[data.placementSettings.strategy]
    : DEFAULT_PLACEMENT_SETTINGS.random.grid,
  renderers: {
    arrow: data.graph.isDirected() ? DefaultArrowRenderer : null,
    edge:
      data.edgeType === 'curved'
        ? DefaultCurvedEdgeRenderer
        : DefaultStraightEdgeRenderer,
    label: DefaultLabelRenderer,
    vertex: DefaultVertexRenderer,
    vertexMask: DefaultVertexMaskRenderer
  }
});

const getPlacementConfig = <V, E>(
  settings: GraphData<V, E>['placementSettings']
) => {
  switch (settings?.strategy) {
    default:
    case 'random':
      switch ((settings as AllRandomPlacementSettings).mesh) {
        case 'grid':
        case 'triangular':
          return {
            density: 'shared',
            minVertexDistance: 'shared'
          };
        case 'random':
        default:
          return {
            containerHeight: 'shared',
            containerWidth: 'shared'
          };
      }
    case 'circle':
    case 'circles':
      return {
        minVertexDistance: 'shared',
        sortVertices: 'shared'
      };
    case 'trees':
      return {
        minColumnDistance: 'shared',
        minRowDistance: 'shared',
        roots: 'shared'
      };
    case 'orbits':
      return {
        layerSizing: 'shared',
        maxSectorAngle: 'shared',
        minVertexDistance: 'shared',
        roots: 'shared',
        symmetrical: 'shared'
      };
  }
};

export const getUpdateConfig = <V, E>(
  data: Omit<AllGraphSettings<V, E>, 'graph'>
) => ({
  componentsSettings: {
    arrow: {
      scale: 'shared'
    },
    edge:
      data.edgeType === 'straight'
        ? {
            // STRAIGHT EDGE PROPERTIES
            maxOffsetFactor: 'shared'
          }
        : undefined,
    label: {
      scale: 'shared'
    }
  },
  eventSettings: data.eventSettings && {
    press: data.eventSettings.press && {
      disableAnimation: 'shared'
    }
  },
  focusSettings: {
    disableGestures: 'shared',
    points: 'shared',
    progress: 'shared'
  },
  graph: 'shallow',
  layoutSettings:
    data.layoutSettings.type === 'force'
      ? {
          // FORCE LAYOUT PROPERTIES
          attractionForceFactor: 'shared',
          attractionScale: 'shared',
          minUpdateDistance: 'shared',
          refreshInterval: 'shared',
          repulsionScale: 'shared'
        }
      : undefined,
  placementSettings: getPlacementConfig(data.placementSettings)
});
