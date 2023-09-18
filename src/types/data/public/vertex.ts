import { WithValue } from '@/types/utils';

export type VertexData<V = undefined> = WithValue<
  V,
  {
    key: string;
  }
>;
