/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PropsWithChildren, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import {
  AUTO_SIZING_TIMEOUT,
  DEFAULT_SCALES,
  INITIAL_SCALE
} from '@/constants/views';
import { ContextProviderComposer } from '@/providers/utils';
import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { updateSpacing } from '@/utils/layout';

import { AutoSizingProvider } from './auto';
import { CanvasDataProvider } from './data';
import { GesturesProvider } from './gestures';
import SettingsChangeResponderProvider from './settings/SettingsChangeResponderProvider';
import { FocusProvider, TransformProvider } from './transform';

type CanvasProviderProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
}>;

export default function CanvasProvider({
  autoSizingTimeout: autoSizingTimeoutProp = AUTO_SIZING_TIMEOUT,
  children,
  initialScale: initialScaleProp,
  objectFit: objectFitProp = 'none',
  padding: paddingProp,
  scales: scalesProp = DEFAULT_SCALES
}: CanvasProviderProps) {
  // Store canvas settings in shared values to prevent re-renders
  const autoSizingTimeout = useDerivedValue(
    () => autoSizingTimeoutProp,
    [autoSizingTimeoutProp]
  );
  const initialScaleProvided = useDerivedValue(
    () => !!initialScaleProp,
    [initialScaleProp]
  );
  const initialScale = useDerivedValue(
    () => initialScaleProp ?? INITIAL_SCALE,
    [initialScaleProp]
  );
  const objectFit = useDerivedValue(() => objectFitProp, [objectFitProp]);
  const padding = useDerivedValue(
    () => updateSpacing(paddingProp),
    [paddingProp]
  );
  const scales = useDerivedValue(() => scalesProp, [scalesProp]);
  const maxScale = useDerivedValue(
    () => scales.value[scales.value.length - 1]!
  );
  const minScale = useDerivedValue(() => scales.value[0]!);

  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to store canvas related data shared
      // across other providers
      <CanvasDataProvider
        autoSizingTimeout={autoSizingTimeout}
        initialScale={initialScale}
        initialScaleProvided={initialScaleProvided}
        maxScale={maxScale}
        minScale={minScale}
        objectFit={objectFit}
        padding={padding}
        scales={scales}
      />,
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
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}
