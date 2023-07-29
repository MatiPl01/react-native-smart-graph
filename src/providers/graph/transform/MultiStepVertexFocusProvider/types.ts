import { SharedValue } from 'react-native-reanimated';

import { CanvasDataContextType, FocusContextType } from '@/providers/canvas';
import { FocusStepData } from '@/types/focus';
import { MultiStepFocusSettings } from '@/types/settings';

export enum MachineState {
  BLUR = 'BLUR',
  BLUR_START = 'BLUR_START',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_START = 'FOCUS_START',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

export type StateProps = {
  afterStep: FocusStepData | null;
  beforeStep: FocusStepData | null;
  canvasDataContext: CanvasDataContextType;
  currentProgress: number;
  focusContext: FocusContextType;
  previousProgress: number;
  settings: MultiStepFocusSettings;
  syncProgress: number;
  targetKey: SharedValue<null | string>;
  vertexRadius: number;
};

export type StateHandler = (props: StateProps) => MachineState;

export type MachineContext = {
  update(
    currentProgress: number,
    previousProgress: number,
    syncProgress: number,
    afterStep: FocusStepData | null,
    beforeStep: FocusStepData | null
  ): void;
};
