/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  cancelAnimation,
  makeMutable,
  SharedValue
} from 'react-native-reanimated';

import { DEFAULT_SETTINGS } from '@/constants/views';
import { GraphViewSettings } from '@/types/settings';
import { deepEqual } from '@/utils/equality';
import { updateSpacing } from '@/utils/layout';

import { CanvasDataContextType } from './context';

export const createContextValue = (
  userSettings: GraphViewSettings
): CanvasDataContextType => ({
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
  padding: makeMutable(updateSpacing(userSettings.padding)),
  scales: makeMutable(userSettings.scales ?? DEFAULT_SETTINGS.scales)
});

export const updateContextValue = (
  value: CanvasDataContextType,
  userSettings: GraphViewSettings
): void => {
  const updateProperty = <T>(
    name: keyof GraphViewSettings,
    property: SharedValue<T>
  ): void => {
    const newValue = (userSettings[name] ?? DEFAULT_SETTINGS[name]) as T;
    if (!deepEqual(property.value, newValue)) {
      property.value = newValue;
    }
  };

  if (userSettings.padding) {
    userSettings.padding = updateSpacing(userSettings.padding);
  }

  updateProperty('autoSizingTimeout', value.autoSizingTimeout);
  updateProperty('initialScale', value.initialScale);
  updateProperty('objectFit', value.objectFit);
  updateProperty('scales', value.scales);
  updateProperty('padding', value.padding);
};

export const clearContextValue = (value: CanvasDataContextType): void => {
  cancelAnimation(value.autoSizingEnabled);
  cancelAnimation(value.autoSizingTimeout);
  cancelAnimation(value.boundingRect.bottom);
  cancelAnimation(value.boundingRect.left);
  cancelAnimation(value.boundingRect.right);
  cancelAnimation(value.boundingRect.top);
  cancelAnimation(value.canvasDimensions.height);
  cancelAnimation(value.canvasDimensions.width);
  cancelAnimation(value.currentScale);
  cancelAnimation(value.currentTranslation.x);
  cancelAnimation(value.currentTranslation.y);
  cancelAnimation(value.gesturesDisabled);
  cancelAnimation(value.initialScale);
  cancelAnimation(value.initialScaleProvided);
  cancelAnimation(value.isGestureActive);
  cancelAnimation(value.isRendered);
  cancelAnimation(value.maxScale);
  cancelAnimation(value.minScale);
  cancelAnimation(value.objectFit);
  cancelAnimation(value.padding);
  cancelAnimation(value.scales);
};
