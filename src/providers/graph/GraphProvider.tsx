import { PropsWithChildren, useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import { ContextProviderComposer } from '@/providers/utils';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { FocusEndSetter, FocusStartSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import { AnimatedBoundingRect, AnimatedDimensions } from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings, GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import { ComponentsDataProvider } from './data';
import { PressEventsProvider, PressEventsProviderProps } from './events';
import {
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  GraphPlacementLayoutProviderProps,
  PlacementLayoutProvider
} from './layout';
import ContainerDimensionsProvider from './layout/ContainerDimensionsProvider';
import { ForcesPlacementProviderProps } from './layout/forces/ForcesPlacementProvider';

const getLayoutProviders = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V, E, ED>
) => {
  switch (settings.layout.managedBy) {
    case 'forces':
      return [
        <ForcesPlacementProvider<ForcesPlacementProviderProps<V, E, ED>>
          graph={graph}
          settings={settings}
        />,
        <ForcesLayoutProvider forcesSettings={settings.layout.settings} />
      ];
    case 'placement':
    default:
      return [
        <PlacementLayoutProvider<GraphPlacementLayoutProviderProps<V, E, ED>>
          graph={graph}
          settings={settings}
        />
      ];
  }
};

const getEventsProviders = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  transform: AnimatedCanvasTransform,
  boundingRect: AnimatedBoundingRect,
  settings: GraphSettingsWithDefaults<V, E, ED>,
  renderLayer: (zIndex: number, layer: JSX.Element) => void
) => {
  if (settings.events) {
    return [
      <PressEventsProvider<PressEventsProviderProps<V, E, ED>>
        boundingRect={boundingRect}
        renderLayer={renderLayer}
        settings={settings.events}
        transform={transform}
      />
    ];
  }
  return [];
};

export type GraphProviderAdditionalProps =
  | {
      boundingRect: AnimatedBoundingRect;
      canvasDimensions: AnimatedDimensions;
      canvasScales: number[];
      endFocus: FocusEndSetter;
      focusStatus: SharedValue<number>;
      initialCanvasScale: number;
      startFocus: FocusStartSetter;
      transform: AnimatedCanvasTransform;
    } & AccessibleOverlayContextType;

type GraphProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<
  {
    graph: Graph<V, E>;
    renderers?: GraphRenderers<V, E>;
    settings?: GraphSettings<V, E, ED>;
  } & GraphProviderAdditionalProps
>;

// eslint-disable-next-line import/no-unused-modules
export default function GraphProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  canvasDimensions,
  canvasScales,
  children,
  endFocus,
  focusStatus,
  graph,
  initialCanvasScale,
  renderLayer,
  renderers,
  settings,
  startFocus,
  transform
}: GraphProviderProps<V, E, ED>) {
  const memoSettings = useMemo(
    () => updateGraphSettingsWithDefaults(graph.isDirected(), settings),
    [graph, settings]
  );

  const memoRenderers = useMemo(
    () =>
      updateGraphRenderersWithDefaults(
        graph.isDirected(),
        memoSettings.components.edge.type,
        renderers
      ),
    [graph, memoSettings, renderers]
  );

  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider
        graph={graph}
        renderers={memoRenderers}
        settings={memoSettings}
      />,
      // LAYOUT
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider boundingRect={boundingRect} />,
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      ...getLayoutProviders(graph, memoSettings)
      // EVENTS
      // Press events provider
      // ...getEventsProviders(transform, boundingRect, memoSettings, renderLayer),
      // // FOCUS
      // // Provider used to focus on a specific vertex
      // <VertexFocusProvider
      //   availableScales={canvasScales}
      //   canvasDimensions={canvasDimensions}
      //   endFocus={endFocus}
      //   focusStatus={focusStatus}
      //   graph={graph}
      //   initialScale={initialCanvasScale}
      //   startFocus={startFocus}
      //   vertexRadius={memoSettings.components.vertex.radius}
      // />
    ],
    [memoRenderers]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}
