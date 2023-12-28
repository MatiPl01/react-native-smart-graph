import { WithValue } from '@/types/utils';

export type DirectedEdgeData<E = unknown> = WithValue<
  E,
  {
    from: string;
    key: string;
    to: string;
  }
>;

export type UndirectedEdgeData<E = unknown> = WithValue<
  E,
  {
    key: string;
    vertices: Array<string>;
  }
>;
