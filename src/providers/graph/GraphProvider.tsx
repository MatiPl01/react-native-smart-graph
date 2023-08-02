import { memo, PropsWithChildren, useMemo, useState } from 'react';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import {
  CanvasDataContextType,
  FocusContextType,
  TransformContextType
} from '@/providers/canvas';
import { ContextProviderComposer } from '@/providers/utils';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { Graph } from '@/types/graphs';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { GraphSettingsWithDefaults } from '@/types/settings';
import { updateGraphRenderersWithDefaults } from '@/utils/components';
import { deepMemoComparator } from '@/utils/equality';

import { ComponentsDataProvider } from './data';
import { PressEventsProvider, PressEventsProviderProps } from './events';
import {
  ContainerDimensionsProvider,
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  ForcesPlacementProviderProps,
  GraphPlacementLayoutProviderProps,
  PlacementLayoutProvider
} from './layout';
import { MultiStepVertexFocusProvider, VertexFocusProvider } from './transform';

const getLayoutProviders = <V, E>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V>,
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
  settings: GraphSettingsWithDefaults<V>,
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
    canvasDataContext: CanvasDataContextType;
    focusContext: FocusContextType;
    transformContext: TransformContextType;
  } & AccessibleOverlayContextType &
    (DirectedGraphComponentProps<V, E> | UndirectedGraphComponentProps<V, E>)
>;

// eslint-disable-next-line import/no-unused-modules
function GraphProvider<V, E>({
  canvasDataContext,
  children,
  focusContext,
  graph,
  renderLayer,
  renderers,
  settings,
  transformContext
}: GraphProviderProps<V, E>) {
  const [updatedSettings, q] = useState<GraphSettingsWithDefaults<V> | null>(
    null
  );

  const memoRenderers = useMemo(
    () =>
      updatedSettings &&
      updateGraphRenderersWithDefaults(
        graph.isDirected(),
        updatedSettings.components.edge.type,
        renderers
      ),
    [graph, updatedSettings, renderers]
  );

  const transform = useMemo(
    () => ({
      scale: canvasDataContext.currentScale,
      translateX: canvasDataContext.currentTranslation.x,
      translateY: canvasDataContext.currentTranslation.y
    }),
    []
  );

  const providers = useMemo(
    () =>
      updatedSettings && memoRenderers
        ? [
            // DATA
            // The main provider used to react on graph changes and update
            // components data accordingly
            <ComponentsDataProvider
              graph={graph}
              renderers={memoRenderers}
              settings={updatedSettings}
            />,
            // LAYOUT
            // Providers used to compute the layout of the graph and animate
            // vertices based on calculated positions
            ...getLayoutProviders(
              graph,
              updatedSettings,
              transformContext.handleGraphRender
            ),
            // Provider used to compute the dimensions of the container
            <ContainerDimensionsProvider
              boundingRect={canvasDataContext.boundingRect}
              vertexRadius={updatedSettings.components.vertex.radius}
            />,
            // EVENTS
            // Press events provider
            ...getEventsProviders(
              transform,
              canvasDataContext.boundingRect,
              updatedSettings,
              renderLayer
            ),
            // FOCUS
            // Provider used to focus on a specific vertex
            <VertexFocusProvider
              availableScales={canvasDataContext.scales}
              canvasDimensions={canvasDataContext.canvasDimensions}
              focusContext={focusContext}
              graph={graph}
              initialScale={canvasDataContext.initialScale}
              vertexRadius={updatedSettings.components.vertex.radius}
            />,
            // Provider used to focus one of the vertices specified in an
            // array based on the user-defined progress
            ...(updatedSettings.focus
              ? [
                  <MultiStepVertexFocusProvider
                    canvasDataContext={canvasDataContext}
                    focusContext={focusContext}
                    settings={updatedSettings.focus}
                    vertexRadius={updatedSettings.components.vertex.radius}
                  />
                ]
              : [])
          ]
        : [],
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
