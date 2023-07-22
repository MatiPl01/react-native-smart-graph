import { memo, PropsWithChildren, useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import { AutoSizingContextType } from '@/providers/canvas';
import { ContextProviderComposer } from '@/providers/utils';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { FocusEndSetter, FocusStartSetter } from '@/types/focus';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  BoundingRect
} from '@/types/layout';
import { GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';
import { deepMemoComparator } from '@/utils/equality';

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
import VertexFocusProvider from './transform/VertexFocusProvider';

const getLayoutProviders = <V, E>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V, E>,
  onRender: (boundingRect: BoundingRect) => void
) => {
  switch (settings.layout.managedBy) {
    case 'forces':
      return [
        <ForcesPlacementProvider<ForcesPlacementProviderProps<V, E>>
          graph={graph}
          onRender={onRender}
          settings={settings}
        />,
        <ForcesLayoutProvider forcesSettings={settings.layout.settings} />
      ];
    case 'placement':
    default:
      return [
        <PlacementLayoutProvider<GraphPlacementLayoutProviderProps<V, E>>
          graph={graph}
          onRender={onRender}
          settings={settings}
        />
      ];
  }
};

const getEventsProviders = <V, E>(
  transform: AnimatedCanvasTransform,
  boundingRect: AnimatedBoundingRect,
  settings: GraphSettingsWithDefaults<V, E>,
  renderLayer: (zIndex: number, layer: JSX.Element) => void
) => {
  if (settings.events) {
    return [
      <PressEventsProvider<PressEventsProviderProps<V, E>>
        boundingRect={boundingRect}
        renderLayer={renderLayer}
        settings={settings.events}
        transform={transform}
      />
    ];
  }
  return [];
};

type GraphProviderProps<V, E> = PropsWithChildren<
  {
    autoSizingContext: AutoSizingContextType;
    boundingRect: AnimatedBoundingRect;
    canvasDimensions: AnimatedDimensions;
    canvasScales: SharedValue<number[]>;
    endFocus: FocusEndSetter;
    focusKey: SharedValue<null | string>;
    focusStatus: SharedValue<number>;
    focusTransitionProgress: SharedValue<number>;
    initialCanvasScale: SharedValue<number>;
    onRender: (containerBounds: BoundingRect) => void;
    startFocus: FocusStartSetter;
    transform: AnimatedCanvasTransform;
  } & AccessibleOverlayContextType &
    (DirectedGraphComponentProps<V, E> | UndirectedGraphComponentProps<V, E>)
>;

// eslint-disable-next-line import/no-unused-modules
function GraphProvider<V, E>({
  autoSizingContext,
  boundingRect,
  canvasDimensions,
  canvasScales,
  children,
  endFocus,
  focusKey,
  focusStatus,
  focusTransitionProgress,
  graph,
  initialCanvasScale,
  onRender,
  renderLayer,
  renderers,
  settings,
  startFocus,
  transform
}: GraphProviderProps<V, E>) {
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
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      ...getLayoutProviders(graph, memoSettings, onRender),
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider
        boundingRect={boundingRect}
        vertexRadius={memoSettings.components.vertex.radius}
      />,
      // EVENTS
      // Press events provider
      ...getEventsProviders(transform, boundingRect, memoSettings, renderLayer),
      // FOCUS
      // Provider used to focus on a specific vertex
      <VertexFocusProvider
        availableScales={canvasScales}
        canvasDimensions={canvasDimensions}
        endFocus={endFocus}
        focusKey={focusKey}
        focusStatus={focusStatus}
        focusTransitionProgress={focusTransitionProgress}
        graph={graph}
        initialScale={initialCanvasScale}
        startFocus={startFocus}
        vertexRadius={memoSettings.components.vertex.radius}
      />
    ],
    [memoRenderers]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}

export default memo(
  GraphProvider,
  deepMemoComparator({
    include: ['graph', 'renderers', 'settings'],
    shallow: ['graph']
  })
) as typeof GraphProvider;
