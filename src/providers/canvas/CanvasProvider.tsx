import { useMemo } from 'react';

import { ContextProviderComposer } from '@/providers/utils';

import { AutoSizingProvider } from './auto';
import { CanvasDataProvider } from './data';
import { CanvasDataProviderProps } from './data/CanvasDataProvider';
import { GesturesProvider } from './gestures';
import { SettingsChangeResponderProvider } from './settings';
import { FocusProvider, TransformProvider } from './transform';

type CanvasProviderProps = CanvasDataProviderProps;

export default function CanvasProvider({
  children,
  ...restProps
}: CanvasProviderProps) {
  const providers = useMemo(
    () => [
      // TRANSLATION
      // The provider used to handle canvas translation and scale
      // operations
      <TransformProvider />,
      // AUTO SIZING
      // The provider used to handle canvas auto sizing based on
      // the object fit property
      <AutoSizingProvider />,
      // FOCUS
      // The provider used to handle canvas focus operations
      <FocusProvider />,
      // GESTURES
      // The provider used to handle canvas gestures (pan, pinch, etc.)
      <GesturesProvider />,
      // SETTINGS
      // The provider used to handle canvas settings change and respond to such changes
      <SettingsChangeResponderProvider />
    ],
    []
  );

  return (
    // DATA
    // The main provider used to store canvas related data shared
    // across other providers
    // (is used separately to prevent re-renders of other providers
    // as this is the only provider that re-renders on props change)
    <CanvasDataProvider {...restProps}>
      <ContextProviderComposer providers={providers}>
        {children}
      </ContextProviderComposer>
    </CanvasDataProvider>
  );
}
