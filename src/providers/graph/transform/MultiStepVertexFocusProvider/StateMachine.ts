import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { CanvasDataContextType, FocusContextType } from '@/providers/canvas';
import { FocusStepData } from '@/types/focus';
import { MultiStepFocusSettings } from '@/types/settings';
import { isBetween } from '@/utils/math';

import { MachineState, StateHandler } from './types';
import {
  getResultingProgress,
  getTargetKey,
  getTransitionBounds,
  updateTransitionPoints
} from './utils';

// TODO - add handling of cases when the transition was interrupted from outside

const focusStartState: StateHandler = props => {
  'worklet';
  const {
    focusContext,
    settings: { gesturesDisabled },
    targetKey: oldTargetKey
  } = props;

  const targetKey = getTargetKey(props);

  if (targetKey === null) {
    // B - If there is no focused vertex, start the blur animation
    return MachineState.BLUR_START;
  }

  // A - If there is a focused vertex, start the focus animation
  // (Skip if the target has not changed)
  if (oldTargetKey.value !== targetKey) {
    oldTargetKey.value = targetKey;
    const { source: sourceStep } = getTransitionBounds(props);
    // Reset the transition progress if there is no source step
    if (!sourceStep) {
      focusContext.focusTransitionProgress.value = 0;
    }
    // Set the new focus target in the focus context
    focusContext.startFocus(
      {
        customSource: !!sourceStep,
        gesturesDisabled: !!gesturesDisabled,
        key: targetKey
      },
      null
    );
  }

  // Start the focus transition
  return MachineState.FOCUS_TRANSITION;
};

const focusTransitionState: StateHandler = props => {
  'worklet';
  const {
    afterStep,
    beforeStep,
    currentProgress,
    focusContext,
    previousProgress,
    syncProgress,
    targetKey: { value: targetKey }
  } = props;

  const { target: targetStep } = getTransitionBounds(props);

  // C - If  there is no transition target, restart the focus animation
  if (!targetStep) {
    return MachineState.FOCUS_START;
  }

  // D - If the focus target point was reached, change the state to focus
  if (
    syncProgress === 1 &&
    isBetween(targetStep.startsAt, previousProgress, currentProgress)
  ) {
    return MachineState.FOCUS;
  }

  // C - If the target vertex changed, re-start the focus animation
  // with the new target vertex
  if (
    (currentProgress < previousProgress &&
      beforeStep &&
      targetKey !== beforeStep.value.key) ||
    (currentProgress > previousProgress &&
      afterStep &&
      targetKey !== afterStep.value.key)
  ) {
    return MachineState.FOCUS_START;
  }

  // Otherwise, update the focus transition
  // Update the focus context
  updateTransitionPoints(props);
  // Update the transition progress
  focusContext.focusTransitionProgress.value = getResultingProgress(
    targetStep,
    props
  );

  // Continue the focus transition
  return MachineState.FOCUS_TRANSITION;
};

const focusState: StateHandler = props => {
  'worklet';
  const { currentProgress, focusContext, previousProgress } = props;
  const { target: targetStep } = getTransitionBounds(props);

  // Update the transition progress to 1
  focusContext.focusTransitionProgress.value = 1;

  // E - Start the focus animation if the progress is modified
  if (
    targetStep &&
    !isBetween(targetStep.startsAt, previousProgress, currentProgress)
  ) {
    return MachineState.FOCUS_START;
  }

  // Otherwise, stay in the focus state
  return MachineState.FOCUS;
};

const blurStartState: StateHandler = ({ focusContext, targetKey }) => {
  'worklet';
  // G - Immediately start the blur animation
  // Reset the transition progress
  targetKey.value = null;
  focusContext.focusTransitionProgress.value = 0;
  focusContext.endFocus(undefined, null);

  // Start the blur transition
  return MachineState.BLUR_TRANSITION;
};

const blurTransitionState: StateHandler = props => {
  'worklet';
  const { currentProgress, focusContext, previousProgress } = props;
  const { source: sourceStep } = getTransitionBounds(props);

  // Update the transition progress
  const resultingProgress = (focusContext.focusTransitionProgress.value =
    getResultingProgress(null, props));

  // I - If the resulting progress is 1, the blur animation is finished
  if (resultingProgress === 1 || !sourceStep) {
    return MachineState.BLUR;
  }

  // H - If the transition source point was reached again, stop the
  // blur animation and change the state back to focus
  if (isBetween(sourceStep.startsAt, previousProgress, currentProgress)) {
    return MachineState.FOCUS;
  }

  // Otherwise, update the blur transition
  updateTransitionPoints(props);

  // Continue the blur transition
  return MachineState.BLUR_TRANSITION;
};

const blurState: StateHandler = props => {
  'worklet';
  const targetKey = getTargetKey(props);

  // J - if progress is modified, and there is a target vertex, start the
  // focus animation
  if (targetKey) {
    // Start the synchronization progress (animation between the current
    // canvas position and the target position calculated based on the
    // focused vertex position)
    return MachineState.FOCUS_START;
  }

  // Otherwise, stay in the blur state
  return MachineState.BLUR;
};

const STATE_HANDLERS: Record<MachineState, StateHandler> = {
  [MachineState.BLUR]: blurState,
  [MachineState.BLUR_START]: blurStartState,
  [MachineState.BLUR_TRANSITION]: blurTransitionState,
  [MachineState.FOCUS]: focusState,
  [MachineState.FOCUS_START]: focusStartState,
  [MachineState.FOCUS_TRANSITION]: focusTransitionState
};

type MachineContext = {
  update(
    currentProgress: number,
    previousProgress: number,
    syncProgress: number,
    afterStep: FocusStepData | null,
    beforeStep: FocusStepData | null
  ): void;
};

/*
State machine diagram: // TODO - make it vertical

    +------------------------------------------- J -----------------------------------------------------------+
    |                                                                                                         |
    |   +------------------------------  B ---------------------------+                                       |
    |   |                                                             |                                       |  
    v   |                                                             v                                       |
FOCUS_START -- A --> FOCUS_TRANSITION -- D --> FOCUS --- F ---> BLUR_START -- G --> BLUR_TRANSITION -- I --> BLUR
    ^   ^                     |                 |  ^                                    |
    |   |                     |                 |  |                                    |
    |   +------- C -----------+                 |  +---------------- H -----------------+
    |                                           |                                     
    +--------------------- E -------------------+

Transition descriptions:
// TODO - add descriptions
*/
export const useStateMachine = (
  focusContext: FocusContextType,
  canvasDataContext: CanvasDataContextType,
  settings: MultiStepFocusSettings,
  vertexRadius: number
): MachineContext => {
  const state = useSharedValue<MachineState>(MachineState.BLUR);
  const targetKey = useSharedValue<null | string>(null);

  return useMemo<MachineContext>(
    () => ({
      state,
      update(
        currentProgress,
        previousProgress,
        syncProgress,
        beforeStep,
        afterStep
      ) {
        'worklet';
        let result = state.value;
        do {
          state.value = result;
          result = STATE_HANDLERS[state.value]({
            afterStep,
            beforeStep,
            canvasDataContext,
            currentProgress,
            focusContext,
            previousProgress,
            settings,
            syncProgress,
            targetKey,
            vertexRadius
          });
          console.log(result);
        } while (result !== state.value);
      }
    }),
    [focusContext, settings]
  );
};
