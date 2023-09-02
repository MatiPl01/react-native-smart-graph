import {
  StraightEdgeRenderer,
  StraightEdgeRendererProps
} from '@/types/components';

type StraightEdgeComponentProps<E> = Omit<
  StraightEdgeRendererProps<E>,
  'key'
> & {
  edgeKey: string;
  renderer: StraightEdgeRenderer<E>;
};

export default function StraightEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: StraightEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}
