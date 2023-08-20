import {
  StraightEdgeRenderer,
  StraightEdgeRendererProps
} from '@/types/components';

type RenderedStraightEdgeComponentProps<E> = Omit<
  StraightEdgeRendererProps<E>,
  'key'
> & {
  edgeKey: string;
  renderer: StraightEdgeRenderer<E>;
};

export default function RenderedCurvedEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: RenderedStraightEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}
