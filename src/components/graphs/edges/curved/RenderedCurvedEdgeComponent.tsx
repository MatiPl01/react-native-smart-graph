import {
  CurvedEdgeRenderer,
  CurvedEdgeRendererProps
} from '@/types/components';

type RenderedCurvedEdgeComponentProps<E> = Omit<
  CurvedEdgeRendererProps<E>,
  'key'
> & {
  edgeKey: string;
  renderer: CurvedEdgeRenderer<E>;
};

export default function RenderedCurvedEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: RenderedCurvedEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}
