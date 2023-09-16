import {
  FocusStepData,
  MultiStepFocusStateProps as StateProps
} from '@/types/data';

export enum MachineState {
  BLUR = 'BLUR',
  BLUR_START = 'BLUR_START',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_START = 'FOCUS_START',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

export type StateHandler = <V>(props: StateProps<V>) => MachineState;

export type MachineContext<V> = {
  isStopped(): boolean;
  start(): void;
  stop(): void;
  update(
    currentProgress: number,
    previousProgress: number,
    syncProgress: number,
    afterStep: FocusStepData<V> | null,
    beforeStep: FocusStepData<V> | null,
    vertexRadius: number
  ): void;
};
