import { PropsWithChildren, useEffect, useState } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  useWorkletCallback,
  withTiming
} from 'react-native-reanimated';

import { DEFAULT_GESTURE_ANIMATION_SETTINGS } from '@/constants/animations';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withGraphData } from '@/providers/graph/data/components';
import { useVertexFocusContext } from '@/providers/graph/transform/VertexFocusProvider';
import { VertexComponentData } from '@/types/components';
import { FocusStepData } from '@/types/focus';
import { MultiStepFocusSettings } from '@/types/settings';
import { binarySearchLE } from '@/utils/algorithms';
import { getFocusSteps } from '@/utils/focus';

import { useStateMachine } from './StateMachine';

type MultiStepFocusProviderProps<V, E> = PropsWithChildren<{
  settings: MultiStepFocusSettings;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function MultiStepVertexFocusProvider<V, E>({
  children,
  settings,
  vertexRadius,
  verticesData
}: MultiStepFocusProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const { dataContext: canvasDataContext, focusContext } = useCanvasContexts();
  // Graph contexts
  const { isVertexFocused } = useVertexFocusContext();

  // MULTI STEP FOCUS DATA
  const [focusStepsData, setFocusStepsData] = useState<
    Array<FocusStepData<V, E>>
  >([]);

  // OTHER VALUES
  const isEnabled = useDerivedValue(
    // Enable the multi step focus when the vertex is not focused
    // and no gesture is being performed
    () => !isVertexFocused.value && !canvasDataContext.isGestureActive.value
  );
  // Used to determine the direction of the progress
  const previousProgress = useSharedValue(0);
  const initialStep = useSharedValue(-1);
  const previousStep = useSharedValue(-1);

  // State machine
  const syncProgress = useSharedValue(0);

  const stateMachine = useStateMachine(
    focusContext,
    canvasDataContext,
    settings,
    vertexRadius
  );

  const startSync = useWorkletCallback(() => {
    // Make it non-zero to prevent reaction from calling sync infinitely
    syncProgress.value = 0.00001;
    syncProgress.value = withTiming(1, DEFAULT_GESTURE_ANIMATION_SETTINGS); // TODO - maybe make this customizable
  }, []);

  const updateInitialStep = useWorkletCallback(
    (progress: null | number, data: Array<FocusStepData<V, E>>) => {
      if (progress === null) {
        initialStep.value = -1;
        return;
      }
      const step = binarySearchLE(data, progress, ({ startsAt }) => startsAt);
      syncProgress.value = 0;
      if (step === initialStep.value) return;
      initialStep.value = step;
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
        vertex: verticesData[value.key]!
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
  }, [settings.points, verticesData]);

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

  // Start syncing the progress if the progress value changes
  // (For smooth graph transition from current position to the
  // focus position when the focus is enabled)
  useAnimatedReaction(
    () => ({
      enabled: isEnabled.value,
      progress: settings.progress.value
    }),
    ({ enabled }) => {
      if (enabled && syncProgress.value === 0) {
        startSync();
      }
    }
  );

  // The main reaction that updates the focus context
  useAnimatedReaction(
    () => ({
      progress: {
        current: settings.progress.value,
        previous: previousProgress.value,
        sync: syncProgress.value
      },
      step: initialStep.value
    }),
    ({ progress, step }) => {
      if (step === -1) {
        return;
      }

      // Get the current state of the transition
      const prevStep = previousStep.value;
      const currentSteps = getFocusSteps(
        progress.current,
        prevStep,
        focusStepsData
      );
      if (!currentSteps) return;
      const { afterStep, beforeStep, currentStep } = currentSteps;

      // Update the state machine
      stateMachine.update(
        progress.current,
        progress.previous,
        progress.sync,
        beforeStep,
        afterStep
      );

      // Update values for the next reaction
      previousProgress.value = progress.current;
      previousStep.value = currentStep;
    },
    [focusStepsData]
  );

  return <>{children}</>;
}

export default withGraphData(
  MultiStepVertexFocusProvider,
  ({ verticesData }) => ({ verticesData })
);
