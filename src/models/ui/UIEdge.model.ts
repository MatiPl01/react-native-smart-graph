import { GraphEdge, UIEdge as IUIEdge } from '@/types/models';

export default class UIEdge<E, V, GE extends GraphEdge<E, V>>
  implements IUIEdge<E, V, GE>
{
  constructor(private readonly edge$: GE) {}

  get edge(): GE {
    return this.edge$;
  }
}
