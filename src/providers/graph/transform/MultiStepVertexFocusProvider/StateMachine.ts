import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/canvas';
import { FocusStepData } from '@/types/focus';
import { MultiStepFocusSettings } from '@/types/settings';

enum MachineState {
  BLUR_START = 'BLUR_START',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_START = 'FOCUS_START',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

type StateHandler = (props: {
  afterStep?: FocusStepData;
  beforeStep?: FocusStepData;
  focusContext: FocusContextType;
  progress: number;
  settings: MultiStepFocusSettings;
}) => MachineState;

const focusStartState: StateHandler = ({ focusContext, settings }) => {
  'worklet';
  // Start the focus animation
  // focusContext.startFocus({});
  return MachineState.FOCUS_TRANSITION; // TODO - implement
};

const focusTransitionState: StateHandler = props => {
  'worklet';
  return MachineState.FOCUS_TRANSITION; // TODO - implement
};

const focusState: StateHandler = props => {
  'worklet';
  return MachineState.FOCUS; // TODO - implement
};

const blurStartState: StateHandler = props => {
  'worklet';
  return MachineState.BLUR_START; // TODO - implement
};

const blurTransitionState: StateHandler = props => {
  'worklet';
  return MachineState.BLUR_TRANSITION; // TODO - implement
};

const STATE_HANDLERS: Record<MachineState, StateHandler> = {
  [MachineState.BLUR_START]: blurStartState,
  [MachineState.BLUR_TRANSITION]: blurTransitionState,
  [MachineState.FOCUS]: focusState,
  [MachineState.FOCUS_START]: focusStartState,
  [MachineState.FOCUS_TRANSITION]: focusTransitionState
};

type MachineContext = {
  update(
    progress: number,
    afterStep?: FocusStepData,
    beforeStep?: FocusStepData
  ): void;
};

export const useStateMachine = (
  focusContext: FocusContextType,
  settings: MultiStepFocusSettings
): MachineContext => {
  const state = useSharedValue<MachineState>(MachineState.FOCUS);

  return useMemo<MachineContext>(
    () => ({
      update(progress, afterStep, beforeStep) {
        'worklet';
        state.value = STATE_HANDLERS[state.value]({
          afterStep,
          beforeStep,
          focusContext,
          progress,
          settings
        });
      }
    }),
    [focusContext, settings]
  );
};
