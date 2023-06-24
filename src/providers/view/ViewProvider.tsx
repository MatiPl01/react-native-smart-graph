import { PropsWithChildren, useMemo } from 'react';

import { ContextProviderComposer } from '@/providers/utils';
import { ObjectFit } from '@/types/views';

type ViewProviderProps = PropsWithChildren<{
  objectFit: ObjectFit;
}>;

export default function ViewProvider({
  children,
  objectFit
}: ViewProviderProps) {
  const providers = useMemo(() => [], [objectFit]);

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}
