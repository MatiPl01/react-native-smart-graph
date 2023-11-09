import { useEffect, useMemo } from 'react';

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
  ...restProps
}: RenderedEdgeComponentProps<E>) {
  const edgeObserver = useMemo<EdgeObserver<E>>(
    () => ({
      valueChanged: console.log
    }),
    []
  );

  useEffect(() => {
    addObserver(edgeObserver);
    return () => removeObserver(edgeObserver);
  }, [addObserver, removeObserver, edgeObserver]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return renderer({ key, ...restProps } as any);
}
