/* eslint-disable import/no-unused-modules */
/**
 * This file is the entry point for the library.
 *
 * It exports all the components, models and types that are available to the
 * library's users.
 */

// COMPONENTS
export { default as GraphViewControls } from '@/components/controls/GraphViewControls';
export { default as DirectedGraphComponent } from '@/components/graphs/DirectedGraphComponent';
export { default as UndirectedGraphComponent } from '@/components/graphs/UndirectedGraphComponent';

// RENDERERS
export { default as DefaultEdgeArrowRenderer } from '@/components/graphs/arrows/renderers/DefaultEdgeArrowRenderer';
export { default as DefaultCurvedEdgeRenderer } from '@/components/graphs/edges/curved/renderers/DefaultCurvedEdgeRenderer';
export { default as DefaultStraightEdgeRenderer } from '@/components/graphs/edges/straight/renderers/DefaultStraightEdgeRenderer';
export { default as DefaultEdgeLabelRenderer } from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
export { default as DefaultVertexRenderer } from '@/components/graphs/vertices/renderers/DefaultVertexRenderer';

// MODELS
export { default as DirectedGraph } from '@/models/graphs/DirectedGraph';
export { default as UndirectedGraph } from '@/models/graphs/UndirectedGraph';

// VIEWS
export { default as GraphView } from '@/components/views/GraphView';

// HOOKS
export * from '@/hooks';

// ALGORITHMS
export * from '@/utils/algorithms';

// TYPES
export {
  type DirectedEdgeData,
  type DirectedGraphData,
  type UndirectedEdgeData,
  type UndirectedGraphData,
  type VertexData
} from '@/types/data';
export {
  type DirectedEdge,
  type DirectedGraphVertex,
  type Edge,
  type Graph,
  type GraphConnections,
  type GraphObserver,
  type UndirectedEdge,
  type Vertex
} from '@/types/graphs';
export {
  type Alignment,
  type HorizontalAlignment,
  type Spacing,
  type VerticalAlignment
} from '@/types/layout';
export {
  type CurvedEdgeRendererProps,
  type DirectedGraphRenderers,
  type EdgeArrowRendererProps,
  type EdgeLabelRendererProps,
  type StraightEdgeRendererProps,
  type UndirectedGraphRenderers,
  type VertexRendererProps
} from '@/types/renderer';
export {
  type AnimationSettings,
  type AnimationsSettings,
  type AutoLayoutSettings,
  type BatchModificationAnimationSettings,
  type BoundRandomPlacementSettings,
  type CircularPlacementSettings,
  type DefaultForcesStrategySettings,
  type DirectedEdgeSettings,
  type DirectedGraphComponentsSettings,
  type DirectedGraphSettings,
  type EdgeLabelSettings,
  type FocusPoint,
  type FocusPoints,
  type FocusSettings,
  type ForcesLayoutSettings,
  type ForcesSettings,
  type ForcesStrategy,
  type GetLayerRadiusFunction,
  type GraphAnimationsSettings,
  type GraphEventsSettings,
  type GraphLayoutSettings,
  type GraphMeshType,
  type GraphPlacementSettings,
  type OrbitsLayerSizing,
  type OrbitsLayerSizingSettings,
  type OrbitsPlacementSettings,
  type PlacementStrategy,
  type RandomMeshType,
  type RandomPlacementSettings,
  type SingleModificationAnimationSettings,
  type TreesPlacementSettings,
  type UnboundRandomPlacementSettings,
  type UndirectedEdgeSettings,
  type UndirectedGraphComponentsSettings,
  type UndirectedGraphSettings,
  type VertexPressEvent,
  type VertexPressHandler,
  type VertexSettings
} from '@/types/settings';
export { type ObjectFit } from '@/types/views';
