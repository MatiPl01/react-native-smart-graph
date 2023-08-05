import { GraphAnimationsSettings } from '@/types/settings/public/graph/animations';
import { FocusSettings } from '@/types/settings/public/graph/focus';

export type GraphObserver = {
  focusChanged?: (vertexKey: null | string, settings?: FocusSettings) => void;
  graphChanged?: (animationsSettings: GraphAnimationsSettings) => void;
};
