import { useEdgeValueObserver } from '@/hooks';
import {
  CurvedEdgeRenderer,
  CurvedEdgeRendererProps,
  StraightEdgeRenderer,
  StraightEdgeRendererProps
} from '@/types/components';
import { EdgeObserver } from '@/types/models';

type RenderedEdgeComponentProps<E> = (
  | (Omit<CurvedEdgeRendererProps<E>, 'key'> & {
      renderer: CurvedEdgeRenderer<E>;
    })
  | (Omit<StraightEdgeRendererProps<E>, 'key'> & {
      renderer: StraightEdgeRenderer<E>;
    })
) & {
  addObserver: (observer: EdgeObserver<E>) => void;
  edgeKey: string;
  removeObserver: (observer: EdgeObserver<E>) => void;
};

export default function RenderedEdgeComponent<E>({
  addObserver,
  edgeKey: key,
  removeObserver,
  renderer,
  value: initialValue,
  ...restProps
}: RenderedEdgeComponentProps<E>) {
  const value = useEdgeValueObserver<E>(
    addObserver,
    removeObserver,
    initialValue
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return renderer({ key, ...restProps, value } as any);
}
