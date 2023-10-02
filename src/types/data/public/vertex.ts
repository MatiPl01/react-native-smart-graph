import { WithValue } from '@/types/utils';

export type VertexData<V = unknown> = WithValue<
  V,
  {
    key: string;
  }
>;
