import { PropsWithChildren, useMemo } from 'react';

import {
  AUTO_SIZING_TIMEOUT,
  DEFAULT_SCALES,
  INITIAL_SCALE
} from '@/constants/views';
import { ContextProviderComposer } from '@/providers/utils';
import { ObjectFit } from '@/types/views';

import { AutoSizingProvider } from './auto';
import { CanvasDataProvider } from './data';
import { GesturesProvider } from './gestures';
import { TransformProvider } from './transform';

type CanvasProviderProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  scales?: number[];
}>;

export default function CanvasProvider({
  autoSizingTimeout = AUTO_SIZING_TIMEOUT,
  children,
  initialScale = INITIAL_SCALE,
  objectFit = 'none',
  scales = DEFAULT_SCALES
}: CanvasProviderProps) {
  // Validate parameters
  if (scales.length === 0) {
    throw new Error('At least one scale must be provided');
  }
  if (scales.indexOf(initialScale) < 0) {
    throw new Error('Initial scale must be included in scales');
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
      />,
      // AUTO SIZING
      // The provider used to handle canvas auto sizing based on
      // the object fit property
      <AutoSizingProvider
        autoSizingTimeout={autoSizingTimeout}
        maxScale={maxScale}
        minScale={minScale}
        objectFit={objectFit}
      />,
      // GESTURES
      // The provider used to handle canvas gestures (pan, pinch, etc.)
      <GesturesProvider
        initialScale={initialScale}
        maxScale={maxScale}
        minScale={minScale}
        scaleValues={scales}
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
