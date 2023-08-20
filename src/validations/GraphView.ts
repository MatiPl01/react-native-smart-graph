import { PropsWithChildren } from 'react';

import { DEFAULT_VIEW_SETTINGS } from '@/configs/view';
import { ObjectFit } from '@/types/layout';
import { GraphViewSettings } from '@/types/settings';
import { updateSpacing } from '@/utils/layout';

export type GraphViewProps = PropsWithChildren<GraphViewSettings>;

const OBJECT_FIT_VALUES = new Set<ObjectFit>(['contain', 'cover', 'none']);

export const validateProps = ({
  autoSizingTimeout,
  initialScale,
  objectFit,
  padding,
  scales
}: GraphViewProps) => {
  // objectFit
  if (objectFit !== undefined && !OBJECT_FIT_VALUES.has(objectFit)) {
    throw new Error(
      `objectFit must be one of ${Array.from(OBJECT_FIT_VALUES).join(', ')}`
    );
  }
  // padding
  if (padding !== undefined) {
    for (const [key, value] of Object.entries(updateSpacing(padding))) {
      if (isNaN(value) || value < 0) {
        throw new Error(`padding.${key} must be a positive number`);
      }
    }
  }
  // autoSizingTimeout
  if (autoSizingTimeout !== undefined) {
    if (isNaN(autoSizingTimeout) || autoSizingTimeout < 0) {
      throw new Error('autoSizingTimeout must be a non-negative number');
    }
  }
  // initialScale
  if (initialScale !== undefined) {
    if (isNaN(initialScale) || initialScale <= 0) {
      throw new Error('initialScale must be a positive number');
    }
  }
  // Scales
  if (scales) {
    if (scales.length === 0) {
      throw new Error('At least one scale must be provided');
    }
    if (
      scales.indexOf(initialScale ?? DEFAULT_VIEW_SETTINGS.initialScale) < 0
    ) {
      throw new Error('Initial scale must be included in scales');
    }
    if (scales.some(scale => scale <= 0)) {
      throw new Error('All scales must be positive');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (scales.some((scale, index) => scale <= scales[index - 1]!)) {
      throw new Error('Scales must be in ascending order');
    }
  }
};
