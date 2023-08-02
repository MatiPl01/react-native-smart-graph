import { Spacing } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export type GraphViewSettings = {
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: number[];
};

export type GraphViewSettingsWithDefaults = Required<GraphViewSettings>;
