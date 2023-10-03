/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CurvedEdgeRenderer,
  EdgeArrowRenderer,
  EdgeLabelRenderer,
  StraightEdgeRenderer,
  VertexLabelRenderer,
  VertexMaskRenderer,
  VertexRenderer
} from '@/types/components/public';
import {
  OptionalPropsRenderer,
  RendererWithProps,
  RequiredWithout
} from '@/types/utils';

type SharedUndirectedGraphRenderers<V, E, VR, VLR, VMR, ELR> = {
  edgeLabel: ELR extends EdgeLabelRenderer<E, any>
    ? OptionalPropsRenderer<ELR> | null
    : never;
  vertex: VR extends VertexRenderer<V, any>
    ? OptionalPropsRenderer<VR> | null
    : never;
  vertexLabel: VLR extends VertexLabelRenderer<E, any>
    ? OptionalPropsRenderer<VLR> | null
    : never;
  vertexMask: VMR extends VertexMaskRenderer<any>
    ? OptionalPropsRenderer<VMR> | null
    : never;
};

type SharedDirectedGraphRenderers<V, E, VR, VLR, VMR, ELR, EAR> =
  SharedUndirectedGraphRenderers<V, E, VR, VLR, VMR, ELR> & {
    edgeArrow: EAR extends EdgeArrowRenderer<any>
      ? OptionalPropsRenderer<EAR> | null
      : never;
  };

export type UndirectedGraphWithStraightEdgeRenderers<
  V,
  E,
  VR,
  VLR,
  VMR,
  ER,
  ELR
> = SharedUndirectedGraphRenderers<V, E, VR, VLR, VMR, ELR> & {
  edge: ER extends StraightEdgeRenderer<E, any>
    ? OptionalPropsRenderer<ER> | null
    : never;
};

export type UndirectedGraphWithCurvedEdgeRenderers<
  V,
  E,
  VR,
  VLR,
  VMR,
  ER,
  ELR
> = SharedUndirectedGraphRenderers<V, E, VR, VLR, VMR, ELR> & {
  edge: ER extends StraightEdgeRenderer<E, any>
    ? OptionalPropsRenderer<ER> | null
    : never;
};

export type DirectedGraphWithStraightEdgeRenderers<
  V,
  E,
  VR,
  VLR,
  VMR,
  ER,
  ELR,
  EAR
> = SharedDirectedGraphRenderers<V, E, VR, VLR, VMR, ELR, EAR> & {
  edge: ER extends StraightEdgeRenderer<E, any>
    ? OptionalPropsRenderer<ER> | null
    : never;
};

export type DirectedGraphWithCurvedEdgeRenderers<
  V,
  E,
  VR,
  VLR,
  VMR,
  ER,
  ELR,
  EAR
> = SharedDirectedGraphRenderers<V, E, VR, VLR, VMR, ELR, EAR> & {
  edge: ER extends CurvedEdgeRenderer<E, any>
    ? OptionalPropsRenderer<ER> | null
    : never;
};

type UndirectedGraphRenderers<V, E, VR, VLR, VMR, ER, ELR> =
  | UndirectedGraphWithCurvedEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR>
  | UndirectedGraphWithStraightEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR>;

type DirectedGraphRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR> =
  | DirectedGraphWithCurvedEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR>
  | DirectedGraphWithStraightEdgeRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR>;

export type GraphRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR> =
  | DirectedGraphRenderers<V, E, VR, VLR, VMR, ER, ELR, EAR>
  | UndirectedGraphRenderers<V, E, VR, VLR, VMR, ER, ELR>;

/*
 * INTERNAL RENDERERS
 */
export type AllInternalGraphRenderers<V, E> = {
  edge:
    | RendererWithProps<CurvedEdgeRenderer<E>>
    | RendererWithProps<StraightEdgeRenderer<E>>
    | null;
  edgeArrow: RendererWithProps<EdgeArrowRenderer> | null;
  edgeLabel: RendererWithProps<EdgeLabelRenderer<E>> | null;
  vertex: RendererWithProps<VertexRenderer<V>> | null;
  vertexLabel: RendererWithProps<VertexLabelRenderer<V>> | null;
  vertexMask: RendererWithProps<VertexMaskRenderer> | null;
};

export type InternalDirectedGraphWithStraightEdgeRenderers<V, E> =
  RequiredWithout<
    Omit<AllInternalGraphRenderers<V, E>, 'edge'>,
    'edgeLabel'
  > & {
    edge: RendererWithProps<StraightEdgeRenderer<E>>;
  };

export type InternalDirectedGraphWithCurvedEdgeRenderers<V, E> =
  RequiredWithout<
    Omit<AllInternalGraphRenderers<V, E>, 'edge'>,
    'edgeLabel'
  > & {
    edge: RendererWithProps<CurvedEdgeRenderer<E>>;
  };

export type InternalUndirectedGraphWithStraightEdgeRenderers<V, E> =
  RequiredWithout<
    Omit<AllInternalGraphRenderers<V, E>, 'edge' | 'edgeArrow'>,
    'edgeLabel'
  > & {
    edge: RendererWithProps<StraightEdgeRenderer<E>>;
  };

export type InternalUndirectedGraphWithCurvedEdgeRenderers<V, E> =
  RequiredWithout<
    Omit<AllInternalGraphRenderers<V, E>, 'edge' | 'edgeArrow'>,
    'edgeLabel'
  > & {
    edge: RendererWithProps<CurvedEdgeRenderer<E>>;
  };
