import { SharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';
import { GraphViewData } from '@/types/components';
import { FocusStepData } from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';

export enum MachineState {
  BLUR = 'BLUR',
  BLUR_START = 'BLUR_START',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_START = 'FOCUS_START',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

export type StateProps<V, E> = {
  afterStep: FocusStepData<V, E> | null;
  beforeStep: FocusStepData<V, E> | null;
  currentProgress: number;
  focusContext: FocusContextType;
  previousProgress: number;
  settings: InternalMultiStepFocusSettings;
  syncProgress: number;
  targetPoint: SharedValue<UpdatedFocusPoint | null>;
  vertexRadius: number;
  viewDataContext: GraphViewData;
};

export type StateHandler = <V, E>(props: StateProps<V, E>) => MachineState;

export type MachineContext<V, E> = {
  isStopped(): boolean;
  start(): void;
  stop(): void;
  update(
    currentProgress: number,
    previousProgress: number,
    syncProgress: number,
    afterStep: FocusStepData<V, E> | null,
    beforeStep: FocusStepData<V, E> | null,
    vertexRadius: number
  ): void;
};
