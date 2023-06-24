import { PropsWithChildren, useMemo } from 'react';

import { DEFAULT_SCALES, INITIAL_SCALE } from '@/constants/views';
import { ContextProviderComposer } from '@/providers/utils';
import { ObjectFit } from '@/types/views';

import { CanvasDataProvider } from './data';
import { TransformProvider } from './transform';

type ViewProviderProps = PropsWithChildren<{
  initialScale?: number;
  objectFit: ObjectFit;
  scales?: number[];
}>;

export default function ViewProvider({
  children,
  initialScale = INITIAL_SCALE,
  objectFit = 'none',
  scales = DEFAULT_SCALES
}: ViewProviderProps) {
  // Validate parameters
  if (scales.length === 0) {
    throw new Error('At least one scale must be provided');
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const minScale = scales[0]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const maxScale = scales[scales.length - 1]!;

  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to store canvas related data shared
      // across other providers
      <CanvasDataProvider initialScale={initialScale} />,

      // TRANSLATION
      // The provider used to handle canvas translation and scale
      // operations
      <TransformProvider
        maxScale={maxScale}
        minScale={minScale}
        objectFit={objectFit}
      />
    ],
    [objectFit]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}
