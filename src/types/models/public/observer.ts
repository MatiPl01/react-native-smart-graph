import { GraphModificationAnimationsSettings } from '@/types/settings';
import { FocusSettings } from '@/types/settings/public/graph/focus';

export type GraphObserver = {
  focusChanged?: (vertexKey: null | string, settings?: FocusSettings) => void;
  graphChanged?: (
    animationsSettings: GraphModificationAnimationsSettings
  ) => void;
};

export type VertexObserver<V> = {
  valueChanged?: (value: V) => void;
};

export type EdgeObserver<E> = {
  valueChanged?: (value: E) => void;
};
