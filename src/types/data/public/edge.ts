import { WithValue } from '@/types/utils';

export type DirectedEdgeData<E = undefined> = WithValue<
  E,
  {
    from: string;
    key: string;
    to: string;
  }
>;

export type UndirectedEdgeData<E = undefined> = WithValue<
  E,
  {
    key: string;
    vertices: Array<string>;
  }
>;
