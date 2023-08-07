import { GraphModificationAnimationsSettings } from '@/types/settings';
import { FocusSettings } from '@/types/settings/public/graph/focus';

export type GraphObserver = {
  focusChanged?: (vertexKey: null | string, settings?: FocusSettings) => void;
  graphChanged?: (
    animationsSettings: GraphModificationAnimationsSettings
  ) => void;
};
