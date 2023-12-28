/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { makeMutable } from 'react-native-reanimated';

import { DEFAULT_VIEW_SETTINGS as DEFAULT_SETTINGS } from '@/configs/view';
import { GraphViewData } from '@/types/components/private/view';
import { GraphViewSettings } from '@/types/settings';
import { cancelAnimations } from '@/utils/animations';
import { updateSpacing } from '@/utils/layout';

export const createContextValue = (
  userSettings: GraphViewSettings
): GraphViewData => ({
  autoSizingEnabled: makeMutable(false),
  autoSizingTimeout: makeMutable(
    userSettings.autoSizingTimeout ?? DEFAULT_SETTINGS.autoSizingTimeout
  ),
  boundingRect: {
    bottom: makeMutable(0),
    left: makeMutable(0),
    right: makeMutable(0),
    top: makeMutable(0)
  },
  canvasDimensions: {
    height: makeMutable(0),
    width: makeMutable(0)
  },
  currentScale: makeMutable(0),
  currentTranslation: {
    x: makeMutable(0),
    y: makeMutable(0)
  },
  gesturesDisabled: makeMutable(false),
  initialScale: makeMutable(
    userSettings.initialScale ?? DEFAULT_SETTINGS.initialScale
  ),
  initialScaleProvided: makeMutable(userSettings.initialScale !== undefined),
  isGestureActive: makeMutable(false),
  isRendered: makeMutable(false),
  maxScale: makeMutable(
    userSettings.scales?.[userSettings.scales.length - 1] ??
      DEFAULT_SETTINGS.scales[DEFAULT_SETTINGS.scales.length - 1]!
  ),
  minScale: makeMutable(
    userSettings.scales?.[0] ?? DEFAULT_SETTINGS.scales[0]!
  ),
  objectFit: makeMutable(userSettings.objectFit ?? DEFAULT_SETTINGS.objectFit),
  padding: makeMutable(
    updateSpacing(userSettings.padding ?? DEFAULT_SETTINGS.padding)
  ),
  scales: makeMutable(userSettings.scales ?? DEFAULT_SETTINGS.scales),
  targetBoundingRect: makeMutable({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  })
});

export const updateContextValue = (
  userSettings: GraphViewSettings,
  value: GraphViewData
): void => {
  value.autoSizingTimeout.value =
    userSettings.autoSizingTimeout ?? DEFAULT_SETTINGS.autoSizingTimeout;
  value.autoSizingEnabled.value = userSettings.autoSizingTimeout !== -1; // disable auto sizing if timeout is -1 (TODO: add to docs)
  value.initialScale.value =
    userSettings.initialScale ?? DEFAULT_SETTINGS.initialScale;
  value.initialScaleProvided.value = userSettings.initialScale !== undefined;
  value.maxScale.value =
    userSettings.scales?.[userSettings.scales.length - 1] ??
    DEFAULT_SETTINGS.scales[DEFAULT_SETTINGS.scales.length - 1]!;
  value.minScale.value =
    userSettings.scales?.[0] ?? DEFAULT_SETTINGS.scales[0]!;
  value.objectFit.value = userSettings.objectFit ?? DEFAULT_SETTINGS.objectFit;
  value.padding.value = updateSpacing(
    userSettings.padding ?? DEFAULT_SETTINGS.padding
  );
  value.scales.value = userSettings.scales ?? DEFAULT_SETTINGS.scales;
};

export const clearContextValue = (value: GraphViewData) =>
  cancelAnimations(value);
