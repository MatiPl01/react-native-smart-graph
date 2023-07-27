import { PropsWithChildren, useEffect, useState } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  useWorkletCallback
} from 'react-native-reanimated';

import { FocusContextType, FocusStatus } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph/data';
import { VertexComponentRenderData } from '@/types/components';
import { FocusStepData } from '@/types/focus';
import { AnimatedDimensions } from '@/types/layout';
import { GraphFocusSettings } from '@/types/settings';
import { binarySearchLE } from '@/utils/algorithms';
import { animateToValue } from '@/utils/animations';
import {
  getFocusStep,
  getMultiStepFocusTransformation,
  updateFocusedVertexTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { useVertexFocusContext } from './VertexFocusProvider';

type MultiStepFocusProviderProps = PropsWithChildren<{
  availableScales: SharedValue<number[]>;
  canvasDimensions: AnimatedDimensions;
  focusContext: FocusContextType;
  initialScale: SharedValue<number>;
  isGestureActive: SharedValue<boolean>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphFocusSettings;
  vertexRadius: number;
}>;

function MultiStepVertexFocusProvider({
  availableScales,
  canvasDimensions,
  children,
  focusContext,
  initialScale,
  isGestureActive,
  renderedVerticesData,
  settings,
  vertexRadius
}: MultiStepFocusProviderProps) {
  // CONTEXT VALUES
  // Vertex focus context values
  const { isVertexFocused } = useVertexFocusContext();

  // MULTI STEP FOCUS DATA
  const [focusStepsData, setFocusStepsData] = useState<Array<FocusStepData>>(
    []
  );

  // OTHER VALUES
  const isEnabled = useDerivedValue(
    // Enable the multi step focus when the vertex is not focused
    // and no gesture is being performed
    () => !isVertexFocused.value && !isGestureActive.value
  );
  // This value is used to ensure that the transition to the current
  // focus points is smooth
  const isProgressSynced = useSharedValue(false);
  // This progress should be used to update the progress of the focus
  // context (for smooth transitions)
  const currentProgress = useSharedValue(0);
  // Used to determine the direction of the progress
  const previousProgress = useSharedValue(0);
  const initialStep = useSharedValue(-1);
  const previousStep = useSharedValue(-1);
  const shouldResetFocus = useSharedValue(false);

  const updateInitialStep = useWorkletCallback(
    (progress: null | number, data: Array<FocusStepData>) => {
      if (progress === null) {
        initialStep.value = -1;
        return;
      }
      const step = binarySearchLE(data, progress, ({ startsAt }) => startsAt);
      if (step === initialStep.value) return;
      initialStep.value = step;
      currentProgress.value = previousProgress.value =
        data[step - 1]?.startsAt ?? 0;
      previousStep.value = initialStep.value = step;
      shouldResetFocus.value = true;
    },
    []
  );

  // Update the orderedFocusPoints array only when the available focus points
  // change (available means that the corresponding vertex is rendered)
  useEffect(() => {
    if (!isEnabled.value) return;
    const newFocusStepsData = Object.entries(settings.points)
      // Order focus points by their start time
      .map(([key, value]) => ({
        startsAt: +key,
        value,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        vertex: renderedVerticesData[value.key]!
      }))
      // Filter out focus points that don't have a corresponding vertex
      .filter(({ vertex }) => vertex)
      .sort(({ startsAt: a }, { startsAt: b }) => a - b);

    // TODO - improve this to check if other values than the startsAt
    // property have changed
    // Check if the focus points have changed
    if (
      newFocusStepsData.length !== focusStepsData.length ||
      newFocusStepsData.some(
        ({ startsAt }, i) => startsAt !== focusStepsData[i]?.startsAt
      )
    ) {
      setFocusStepsData(newFocusStepsData);
    }
  }, [settings.points, renderedVerticesData]);

  // Update the initial step when the progress property is replaced,
  // the focus steps data changes or the isEnabled value changes
  useAnimatedReaction(
    () => isEnabled.value,
    enabled => {
      if (!enabled) updateInitialStep(null, focusStepsData);
      else updateInitialStep(settings.progress.value, focusStepsData);
    },
    [settings.progress, focusStepsData]
  );

  // Synchronize the progress of the focus context with the current progress
  // when the initial step changes
  useAnimatedReaction(
    () => ({
      progress: {
        current: currentProgress.value,
        target: settings.progress.value // TODO - prevent reaction if the DirectedGraphComponent re-renders but the value is the same
      },
      step: initialStep.value
    }),
    ({ progress, step }) => {
      const currentStep = previousStep.value;
      if (
        step === -1 ||
        (!focusStepsData[currentStep] && !focusStepsData[currentStep - 1])
      ) {
        return;
      }
      // Calculate the resulting progress
      const result = isProgressSynced.value
        ? progress.target
        : animateToValue(progress.current, progress.target, 0.01);
      // Update the current progress value
      if (result === progress.target) isProgressSynced.value = true;
      previousProgress.value = currentProgress.value;
      currentProgress.value = result;
    }
  );

  // The main reaction that updates the focus context
  useAnimatedReaction(
    () => ({
      progress: currentProgress.value,
      reset: shouldResetFocus.value,
      step: initialStep.value
    }),
    ({ progress, reset, step }) => {
      if (step === -1 || progress === previousProgress.value) return;

      // Get the current state of the transition
      const prevStep = previousStep.value;
      const currentSteps = getFocusStep(progress, prevStep, focusStepsData);
      if (!currentSteps) return;
      const { afterStep, beforeStep, currentStep } = currentSteps;

      // Calculate the progress of the current step
      const afterProgress = afterStep?.startsAt ?? 1;
      const beforeProgress = beforeStep?.startsAt ?? 0;
      const stepProgress =
        (progress - beforeProgress) / (afterProgress - beforeProgress);

      // Update the focused vertex transformation
      updateFocusedVertexTransformation(
        getMultiStepFocusTransformation(
          stepProgress,
          {
            availableScales: availableScales.value,
            canvasDimensions:
              animatedCanvasDimensionsToDimensions(canvasDimensions),
            disableGestures: !!settings.gesturesDisabled,
            initialScale: initialScale.value,
            vertexRadius
          },
          beforeStep,
          afterStep
        ),
        focusContext
      );

      const focusStatus = focusContext.focusStatus.value;
      // FOCUS START - when the focus status is blur and the multi
      // step focus is enabled
      if (
        reset ||
        ((focusStatus === FocusStatus.BLUR ||
          focusStatus === FocusStatus.BLUR_TRANSITION) &&
          ((beforeStep && progress < previousProgress.value) ||
            (afterStep && progress > previousProgress.value)))
      ) {
        shouldResetFocus.value = false;
        focusContext.startFocus(
          {
            gesturesDisabled: !!settings.gesturesDisabled,
            key: afterStep?.value.key ?? ''
          },
          null
        );
      }
      // FOCUS TRANSITION - after starting the focus, until the first
      // step point is reached
      else if (focusStatus === FocusStatus.FOCUS_TRANSITION) {
        if (currentStep !== previousStep.value) {
          focusContext.focusTransitionProgress.value = 1;
        } else if (progress > previousProgress.value) {
          focusContext.focusTransitionProgress.value = stepProgress;
          focusContext.focus.key.value = afterStep?.value.key ?? '';
        } else {
          focusContext.focusTransitionProgress.value = 1 - stepProgress;
          focusContext.focus.key.value = beforeStep?.value.key ?? '';
        }
      }
      // FOCUS
      else if (focusStatus === FocusStatus.FOCUS) {
        // Update focus transition progress to ensure that components'
        // focus transition progress values are updated
        if (progress > previousProgress.value) {
          focusContext.focusTransitionProgress.value = stepProgress;
          focusContext.focus.key.value = afterStep?.value.key ?? '';
        } else {
          focusContext.focusTransitionProgress.value = 1 - stepProgress;
          focusContext.focus.key.value = beforeStep?.value.key ?? '';
        }
      }

      // BLUR START
      if (
        ((!beforeStep && progress < previousProgress.value) ||
          (!afterStep && progress > previousProgress.value)) &&
        focusStatus !== FocusStatus.BLUR_TRANSITION &&
        focusStatus !== FocusStatus.BLUR
      ) {
        focusContext.endFocus(undefined, null);
      }
      // BLUR TRANSITION
      else if (focusStatus === FocusStatus.BLUR_TRANSITION) {
        if (progress > previousProgress.value) {
          focusContext.focusTransitionProgress.value = stepProgress;
        } else {
          focusContext.focusTransitionProgress.value = 1 - stepProgress;
        }
      }
      // Update values for the next reaction
      previousStep.value = currentStep;
    },
    [focusStepsData]
  );

  return <>{children}</>;
}

export default withGraphData(
  MultiStepVertexFocusProvider,
  ({ renderedVerticesData }) => ({ renderedVerticesData })
);
