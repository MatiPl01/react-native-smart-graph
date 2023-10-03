import { useMemo } from 'react';

import { ContextProviderComposer } from '@/providers/utils';

import { AutoSizingProvider } from './auto';
import { GraphViewDataProvider, GraphViewDataProviderProps } from './data';
import { GesturesProvider } from './gestures';
import { FocusProvider, TransformProvider } from './transform';

type CanvasProviderProps = GraphViewDataProviderProps;

export default function CanvasProvider({
  children,
  ...restProps
}: CanvasProviderProps) {
  const providers = useMemo(
    () => [
      // TRANSLATION
      // The provider used to handle canvas translation and scale
      // operations
      TransformProvider,
      // AUTO SIZING
      // The provider used to handle canvas auto sizing based on
      // the object fit property
      AutoSizingProvider,
      // FOCUS
      // The provider used to handle canvas focus operations
      FocusProvider,
      // GESTURES
      // The provider used to handle canvas gestures (pan, pinch, etc.)
      GesturesProvider
    ],
    []
  );

  return (
    // DATA
    // The main provider used to store canvas related data shared
    // across other providers
    // (is used separately to prevent re-renders of other providers
    // as this is the only provider that re-renders on props change)
    <GraphViewDataProvider {...restProps}>
      <ContextProviderComposer providers={providers}>
        {children}
      </ContextProviderComposer>
    </GraphViewDataProvider>
  );
}
