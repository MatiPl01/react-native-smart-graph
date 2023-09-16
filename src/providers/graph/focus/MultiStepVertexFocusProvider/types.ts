import {
  MultiStepFocusStateProps as StateProps,
  TransformedFocusData
} from '@/types/data';

export enum MachineState {
  BLUR = 'BLUR',
  BLUR_START = 'BLUR_START',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_START = 'FOCUS_START',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

export type StateHandler = (props: StateProps) => MachineState;

export type MachineContext = {
  isStopped(): boolean;
  start(): void;
  stop(): void;
  update(
    data: TransformedFocusData,
    progress: {
      current: number;
      previous: number;
    },
    syncProgress: number // TODO - fix
  ): void;
};
