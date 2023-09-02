import {
  CurvedEdgeRenderer,
  CurvedEdgeRendererProps
} from '@/types/components';

type CurvedEdgeComponentProps<E> = Omit<CurvedEdgeRendererProps<E>, 'key'> & {
  edgeKey: string;
  renderer: CurvedEdgeRenderer<E>;
};

export default function CurvedEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: CurvedEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}
