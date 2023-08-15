import { PropsWithChildren } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { DEFAULT_FOCUS_SETTINGS } from '@/configs/graph';
import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { useVertexFocusContext } from '@/providers/graph/focus/VertexFocusProvider';
import { FocusStepData, VertexComponentData } from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';
import { binarySearchLE } from '@/utils/algorithms';
import { getFocusSteps } from '@/utils/focus';

import { useStateMachine } from './StateMachine';
import { createFocusSteps } from './utils';

type MultiStepFocusProviderProps<V, E> = PropsWithChildren<{
  settings: InternalMultiStepFocusSettings;
  vertexRadius: SharedValue<number>;
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
  const { dataContext: viewDataContext, focusContext } = useCanvasContexts();
  // Graph contexts
  const { isVertexFocused } = useVertexFocusContext();

  // MULTI STEP FOCUS DATA
  const sortedFocusPoints = useDerivedValue<Array<UpdatedFocusPoint>>(() =>
    Object.entries(settings.points.value)
      .map(([startsAt, point]) => ({
        point: {
          vertexScale: DEFAULT_FOCUS_SETTINGS.vertexScale,
          ...point,
          alignment: {
            ...DEFAULT_FOCUS_SETTINGS.alignment,
            ...point.alignment
          }
        },
        startsAt: +startsAt
      }))
      .sort((a, b) => a.startsAt - b.startsAt)
  );
  const focusStepsData = useSharedValue<Array<FocusStepData<V, E>>>([]);

  // OTHER VALUES
  // // Used to determine the direction of the progress
  const previousProgress = useSharedValue(0);
  const previousStepIdx = useSharedValue(-1);
  const syncProgress = useSharedValue(0);

  // State machine
  const stateMachine = useStateMachine(focusContext, viewDataContext, settings);

  const updateFocusSteps = () => {
    'worklet';
    focusStepsData.value = createFocusSteps(
      sortedFocusPoints.value,
      verticesData
    );
    previousStepIdx.value = binarySearchLE(
      focusStepsData.value,
      settings.progress.value,
      ({ startsAt }) => startsAt
    );
  };

  // Enable/disable the state machine
  useAnimatedReaction(
    () => isVertexFocused.value || viewDataContext.isGestureActive.value,
    disabled => {
      if (disabled) {
        if (!stateMachine.isStopped()) {
          stateMachine.stop();
          syncProgress.value = 0;
        }
      } else if (stateMachine.isStopped()) {
        stateMachine.start();
        syncProgress.value = withTiming(1, DEFAULT_FOCUS_ANIMATION_SETTINGS); // TODO - figure out what to do with sync progress
      }
    }
  );

  // Update focus steps data when focus points change
  useAnimatedReaction(
    () => sortedFocusPoints.value,
    () => {
      if (stateMachine.isStopped()) return;
      updateFocusSteps();
    }
  );

  // Update focus steps data when at least one focused vertex changes
  useAnimatedReaction(
    () => null,
    () => {
      if (stateMachine.isStopped()) return;
      // Check if focused vertices have changed
      const stepsData = focusStepsData.value;
      const focusPoints = sortedFocusPoints.value;
      let i = 0;
      for (const {
        point: { key }
      } of focusPoints) {
        if (stepsData[i++]?.vertex !== verticesData[key]) {
          updateFocusSteps();
          return;
        }
      }
    },
    [verticesData]
  );

  // Update focus on progress change or steps change
  useAnimatedReaction(
    () => ({
      progress: {
        current: settings.progress.value,
        previous: previousProgress.value,
        sync: 1 // TODO
      },
      radius: vertexRadius.value
    }),
    ({ progress, radius }) => {
      const prevStepIdx = previousStepIdx.value;
      if (stateMachine.isStopped() || prevStepIdx === -1) return;

      const currentSteps = getFocusSteps(
        progress.current,
        prevStepIdx,
        focusStepsData.value
      );
      if (!currentSteps) return;
      const { afterStep, beforeStep, currentStepIdx } = currentSteps;

      // Update the state machine
      stateMachine.update(
        progress.current,
        progress.previous,
        progress.sync,
        beforeStep,
        afterStep,
        radius
      );

      // Update values for the next reaction
      previousProgress.value = progress.current;
      previousStepIdx.value = currentStepIdx;
    }
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(MultiStepVertexFocusProvider, ({ verticesData }) => ({
    verticesData
  })),
  ({ settings }) => ({
    settings: settings.focus,
    vertexRadius: settings.components.vertex.radius
  })
);
