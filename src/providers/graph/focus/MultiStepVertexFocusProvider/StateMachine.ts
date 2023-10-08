import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';
import { GraphViewData } from '@/types/components';
import { TransformedFocusPoint } from '@/types/data';
import { InternalMultiStepFocusSettings } from '@/types/settings';
import { isBetween } from '@/utils/math';

import { MachineContext, MachineState, StateHandler } from './types';
import {
  getResultingProgress,
  getTargetPoint,
  getTransitionBounds,
  updateTransitionPoints
} from './utils';

const focusStartState: StateHandler = props => {
  'worklet';
  const {
    focusContext,
    settings: { disableGestures },
    targetPoint: oldTargetPoint
  } = props;

  const targetPoint = getTargetPoint(props);
  if (!targetPoint) {
    // B - If there is no focused vertex, start the blur animation
    oldTargetPoint.value = targetPoint;
    return MachineState.BLUR_START;
  }

  // A - If there is a focused vertex, start the focus animation
  // (skip if the target point is the same as the previous one)
  if (oldTargetPoint.value !== targetPoint) {
    oldTargetPoint.value = targetPoint;
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
        gesturesDisabled: disableGestures?.value,
        key: targetPoint.key
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
    data,
    focusContext,
    progress,
    syncProgress,
    targetPoint: { value: targetPoint }
  } = props;

  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  // Update the focus context
  updateTransitionPoints(props);
  // Update the transition progress
  focusContext.transitionProgress.value = getResultingProgress(props);

  // C - If  there is no transition target, restart the focus animation
  if (!targetStep) {
    return MachineState.FOCUS_START;
  }

  if (!sourceStep && progress.current === 0) {
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
    isBetween(targetStep.startsAt, progress.previous, progress.current)
  ) {
    focusContext.transitionProgress.value = 1;
    return MachineState.FOCUS;
  }

  // C - If the target vertex changed, restart the focus animation
  // with the new target vertex
  if (
    (progress.current < progress.previous &&
      data.beforeStep &&
      targetPoint?.startsAt !== data.beforeStep.startsAt) ||
    (progress.current > progress.previous &&
      data.afterStep &&
      targetPoint?.startsAt !== data.afterStep.startsAt)
  ) {
    return MachineState.FOCUS_START;
  }

  // Continue the focus transition
  return MachineState.FOCUS_TRANSITION;
};

const focusState: StateHandler = props => {
  'worklet';
  const {
    progress,
    targetPoint: { value: targetPoint }
  } = props;
  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  // Start step is the target step when the focus state was entered from
  // the focus transition state, whereas the start step is the source step
  // when the focus state was entered from the blur transition state
  const startStep = targetStep ?? (!targetPoint ? sourceStep : null);

  if (startStep) {
    // E - Start the focus animation if the progress is modified
    if (!isBetween(startStep.startsAt, progress.previous, progress.current)) {
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

const blurStartState: StateHandler = ({ focusContext, targetPoint }) => {
  'worklet';
  // F - Immediately start the blur animation
  // Reset the transition progress
  targetPoint.value = null;
  focusContext.transitionProgress.value = 0;
  focusContext.endFocus(undefined, null);

  // Start the blur transition
  return MachineState.BLUR_TRANSITION;
};

const blurTransitionState: StateHandler = props => {
  'worklet';
  const { focusContext, progress } = props;
  const { source: sourceStep } = getTransitionBounds(props);
  const resultingProgress = (focusContext.transitionProgress.value =
    getResultingProgress(props));

  // H - If the resulting progress is 1, the blur animation is finished
  if (resultingProgress === 1 || !sourceStep) {
    focusContext.transitionProgress.value = 1;
    return MachineState.BLUR;
  }

  // G - If the transition source point was reached again, stop the
  // blur animation and change the state back to focus
  if (isBetween(sourceStep.startsAt, progress.previous, progress.current)) {
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
  const targetPoint = getTargetPoint(props);

  // I - if progress is modified, and there is a target vertex, start the
  // focus animation
  if (targetPoint) {
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

/*
State machine diagram:
(I know it's quite complex, but it's the best I could do to visualize it :D)

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
  viewDataContext: GraphViewData,
  settings: InternalMultiStepFocusSettings
): MachineContext => {
  const isStopped = useSharedValue(true);
  const state = useSharedValue(MachineState.BLUR);
  const targetPoint = useSharedValue<TransformedFocusPoint | null>(null);

  let updatesCount = 0;

  return useMemo<MachineContext>(
    () => ({
      isStopped() {
        'worklet';
        return isStopped.value;
      },
      start() {
        'worklet';
        isStopped.value = false;
      },
      state,
      stop() {
        'worklet';
        if (state.value !== MachineState.BLUR) {
          // Update the transition progress with default animation
          focusContext.endFocus(null);
        }
        state.value = MachineState.BLUR;
        targetPoint.value = null;
        isStopped.value = true;
      },
      update(data, progress, syncProgress) {
        'worklet';
        if (isStopped.value) return;
        let result = state.value;
        updatesCount = 0;
        do {
          state.value = result;
          result = STATE_HANDLERS[state.value]({
            data,
            focusContext,
            progress,
            settings,
            syncProgress,
            targetPoint,
            viewDataContext
          });

          // This is a temporary fix for a bug that causes the state machine
          // to get stuck in a loop
          // TODO - fix the bug
          updatesCount++;
          if (updatesCount > 10) {
            break;
          }
        } while (result !== state.value);
        state.value = result;
      }
    }),
    [focusContext, settings]
  );
};
