import { PropsWithChildren, useEffect, useState } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  useWorkletCallback
} from 'react-native-reanimated';

import { FocusContextType, GesturesContextType } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph/data';
import { VertexComponentRenderData } from '@/types/components';
import { FocusStepData } from '@/types/focus';
import { GraphFocusSettings } from '@/types/settings';
import { binarySearchLE } from '@/utils/algorithms';
import { animateToValue } from '@/utils/animations';
import { calcMultiStepFocusTransition } from '@/utils/focus';

import { useVertexFocusContext } from './VertexFocusProvider';

type MultiStepFocusProviderProps = PropsWithChildren<{
  focusContext: FocusContextType;
  gesturesContext: GesturesContextType;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphFocusSettings;
}>;

function MultiStepFocusProvider({
  children,
  focusContext,
  gesturesContext,
  renderedVerticesData,
  settings
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
    () => !isVertexFocused.value && !gesturesContext.isGestureActive.value
  );
  // const initialStep = useSharedValue(-1);
  // This value is used to ensure that the transition to the current
  // focus points is smooth
  const isProgressSynced = useSharedValue(false);
  // This progress should be used to update the progress of the focus
  // context (for smooth transitions)
  const currentProgress = useSharedValue(0);
  // Used to determine the direction of the progress
  const initialStep = useSharedValue(-1);
  const previousStep = useSharedValue(-1);

  const updateInitialStep = useWorkletCallback(
    (progress: null | number, data: Array<FocusStepData>) => {
      if (progress === null) {
        initialStep.value = -1;
        return;
      }
      const step = binarySearchLE(data, progress, ({ startsAt }) => startsAt);
      currentProgress.value = data[step - 1]?.startsAt ?? 0;
      previousStep.value = initialStep.value = step;
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
      enabled: isEnabled.value,
      progress: {
        current: currentProgress.value,
        target: settings.progress.value // TODO - prevent reaction if the DirectedGraphComponent re-renders but the value is the same
      }
      // step: initialStep.value
    }),
    ({ enabled, progress }) => {
      if (!enabled) return;
      // Calculate the resulting progress
      const result = isProgressSynced.value
        ? progress.target
        : animateToValue(progress.current, progress.target);
      // Update the current progress value
      if (result === progress.target) isProgressSynced.value = true;
      currentProgress.value = result;
    }
  );

  // The main reaction that updates the focus context
  useAnimatedReaction(
    () => ({
      enabled: isEnabled.value,
      progress: currentProgress.value
    }),
    ({ enabled, progress }) => {
      if (!enabled) return;

      // Get the current state of the transition
      let currentStep = previousStep.value;
      let afterStep = focusStepsData[currentStep];
      let beforeStep = focusStepsData[currentStep - 1];

      if (!afterStep && !beforeStep) return;

      while (afterStep && progress > afterStep.startsAt) {
        beforeStep = afterStep;
        afterStep = focusStepsData[currentStep + 1];
        currentStep++;
      }
      while (beforeStep && progress < beforeStep.startsAt) {
        afterStep = beforeStep;
        beforeStep = focusStepsData[currentStep - 2];
        currentStep--;
      }

      const afterProgress = afterStep?.startsAt ?? 1;
      const beforeProgress = beforeStep?.startsAt ?? 0;
      const stepProgress =
        (progress - beforeProgress) / (afterProgress - beforeProgress);

      console.log(
        calcMultiStepFocusTransition(stepProgress, beforeStep, afterStep)
      );

      // 1. FOCUS START - when the focus status is blur and the multi
      // step focus is enabled
      // if (focusContext.focusStatus.value === FocusStatus.BLUR) {
      //   focusContext.startFocus(
      //     {
      //       gesturesDisabled: !!settings.gesturesDisabled,
      //       key: afterPoint?.value.key ?? ''
      //     },
      //     null
      //   );
      // }

      // // 2. FOCUS TRANSITION - after starting the focus, until the first
      // // step point is reached
      // if (focusContext.focusStatus.value === FocusStatus.FOCUS_TRANSITION) {
      //   focusContext.focusTransitionProgress.value =
      //     currentStep === initialStep.value ? stepProgress : 1;
      // }

      // // 2. FOCUS - when the next step exists (there is a point that starts at the
      // // progress value equal to 0 or the current step is not the first one - there
      // // is a point that starts at the lower value od the external progress)

      // // 3. BLUR TRANSITION - when the current step progress decreases from 1 to 0
      // // and the current step is the first one in the array of focus points
      // // (there is no point with lower start progress value and no point
      // // starting at the progress value equal to 0)

      // // Update values for the next reaction
      previousStep.value = currentStep;
    },
    [focusStepsData]
  );

  return <>{children}</>;
}

export default withGraphData(
  MultiStepFocusProvider,
  ({ renderedVerticesData }) => ({ renderedVerticesData })
);
