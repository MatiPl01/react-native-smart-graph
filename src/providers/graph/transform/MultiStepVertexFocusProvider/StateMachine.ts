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
    settings: { disableGestures },
    targetKey: oldTargetKey
  } = props;

  const targetKey = getTargetKey(props);
  if (targetKey === null) {
    oldTargetKey.value = targetKey;
    // B - If there is no focused vertex, start the blur animation
    return MachineState.BLUR_START;
  }

  // A - If there is a focused vertex, start the focus animation
  // (Skip if the target has not changed)
  if (oldTargetKey.value !== targetKey) {
    oldTargetKey.value = targetKey;
    const { source: sourceStep } = getTransitionBounds(props);
    // Reset the transition progress if there is no source step or
    // the transition was finished (the new transition will start from
    // the beginning)
    if (!sourceStep || focusContext.transitionProgress.value === 1) {
      focusContext.transitionProgress.value = 0;
    }
    // Set the new focus target in the focus context
    focusContext.startFocus(
      {
        customSource: !!sourceStep,
        gesturesDisabled: disableGestures,
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

  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  // Update the focus context
  updateTransitionPoints(props);
  // Update the transition progress
  focusContext.transitionProgress.value = getResultingProgress(
    targetStep,
    props
  );

  // C - If  there is no transition target, restart the focus animation
  if (!targetStep) {
    return MachineState.FOCUS_START;
  }

  if (!sourceStep && currentProgress === 0) {
    // J - Change state to blur if there was no previous focus target
    // and the current progress is 0 (this will change the container
    // position to the position that it had before the focus transition)
    if (focusContext.previousKey.value === null) {
      return MachineState.BLUR;
    }
    // L - Start blur transition if there was a previous focus target
    // and the current progress is 0 (this will reset the container position
    // to the ideal position)
    return MachineState.BLUR_START;
  }

  // D - If the focus target point was reached, change the state to focus
  if (
    syncProgress === 1 &&
    isBetween(targetStep.startsAt, previousProgress, currentProgress)
  ) {
    focusContext.transitionProgress.value = 1;
    // focusContext.transitionProgress.value = 1;
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

  // Continue the focus transition
  return MachineState.FOCUS_TRANSITION;
};

const focusState: StateHandler = props => {
  'worklet';
  const { currentProgress, previousProgress, targetKey } = props;
  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  // Start step is the target step when the focus state was entered from
  // the focus transition state, whereas the start step is the source step
  // when the focus state was entered from the blur transition state
  const startStep =
    targetStep ?? (targetKey.value === null ? sourceStep : null);

  if (startStep) {
    // E - Start the focus animation if the progress is modified
    if (!isBetween(startStep.startsAt, previousProgress, currentProgress)) {
      return MachineState.FOCUS_START;
    }
  } else {
    // K - Start the blur transition there is no step to start focus
    // transition from
    return MachineState.BLUR_START;
  }

  // Otherwise, stay in the focus state
  return MachineState.FOCUS;
};

const blurStartState: StateHandler = ({ focusContext, targetKey }) => {
  'worklet';
  // F - Immediately start the blur animation
  // Reset the transition progress
  targetKey.value = null;
  focusContext.transitionProgress.value = 0;
  focusContext.endFocus(undefined, null);

  // Start the blur transition
  return MachineState.BLUR_TRANSITION;
};

const blurTransitionState: StateHandler = props => {
  'worklet';
  const { currentProgress, focusContext, previousProgress } = props;
  const { source: sourceStep } = getTransitionBounds(props);

  // Update the transition progress
  const resultingProgress = (focusContext.transitionProgress.value =
    getResultingProgress(null, props));

  // H - If the resulting progress is 1, the blur animation is finished
  if (resultingProgress === 1 || !sourceStep) {
    focusContext.transitionProgress.value = 1;
    return MachineState.BLUR;
  }

  // G - If the transition source point was reached again, stop the
  // blur animation and change the state back to focus
  if (isBetween(sourceStep.startsAt, previousProgress, currentProgress)) {
    focusContext.transitionProgress.value = 0;
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

  // I - if progress is modified, and there is a target vertex, start the
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
State machine diagram:
(I know it's quire complex, but it's the best I could do to visualize it :D)
(I hope I won't have to touch this code ever again)

    +------------------------------------------- I ------------------------------------------------------------+
    |                                                                                                          |
    |   +------------------------------  B ---------------------------+                                        |
    |   |                                                             |                                        |
    |   |                     +--------------- J ---------------------^--------------------------------------+ |
    |   |                     |                                       |                                      | |
    |   |                     |  +------------ L ------------------+  |                                      | |
    |   |                     |  |                                 |  |                                      | |
    v   |                     |  |                                 v  v                                      v |
FOCUS_START -- A --> FOCUS_TRANSITION -- D --> FOCUS --- K ---> BLUR_START -- F --> BLUR_TRANSITION -- H --> BLUR
    ^   ^                     |                 |  ^                                    |
    |   |                     |                 |  |                                    |
    |   +------- C -----------+                 |  +---------------- G -----------------+
    |                                           |                                     
    +--------------------- E -------------------+
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
        } while (result !== state.value);
        state.value = result;
      }
    }),
    [focusContext, settings]
  );
};
