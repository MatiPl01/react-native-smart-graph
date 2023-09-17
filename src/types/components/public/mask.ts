export type VertexMaskRendererProps = {
  key: string;
  r: number;
};

export type VertexMaskRenderer = (
  props: VertexMaskRendererProps
) => JSX.Element | null;
