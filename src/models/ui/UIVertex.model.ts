import { SharedValue } from 'react-native-reanimated';

import { GraphVertex, UIVertex as IUIVertex } from '@/types/models';

export default class UIVertex<V, E, GV extends GraphVertex<V, E>>
  implements IUIVertex<V, E, GV>
{
  constructor(
    private readonly vertex$: GV,
    private readonly x$: SharedValue<number>,
    private readonly y$: SharedValue<number>
  ) {}

  get vertex(): GV {
    return this.vertex$;
  }

  get x(): SharedValue<number> {
    return this.x$;
  }

  get y(): SharedValue<number> {
    return this.y$;
  }
}
