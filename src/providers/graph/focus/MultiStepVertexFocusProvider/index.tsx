import { PropsWithChildren } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DEFAULT_FOCUS_SETTINGS } from '@/configs/graph';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { FocusConfig, FocusPath, VertexComponentData } from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { useStateMachine } from './StateMachine';
import { createFocusSteps, updateFocusPath } from './utils';

type MultiStepFocusProviderProps<V> = PropsWithChildren<{
  settings: InternalMultiStepFocusSettings;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function MultiStepVertexFocusProvider<V>({
  children,
  settings,
  vertexRadius,
  verticesData
}: MultiStepFocusProviderProps<V>) {
  // CONTEXTS
  // Canvas contexts
  const { dataContext: viewDataContext, focusContext } = useCanvasContexts();
  // Graph contexts
  // const { isVertexFocused } = useVertexFocusContext();

  // MULTI STEP FOCUS DATA
  const { points: settingsFocusPoints } = settings;
  const sortedFocusPoints = useDerivedValue<Array<UpdatedFocusPoint>>(() =>
    Object.entries(settingsFocusPoints.value)
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

  // FOCUS PATH TRANSITION DATA
  const { canvasDimensions } = viewDataContext;
  const focusConfig = useDerivedValue<FocusConfig>(
    () => ({
      canvasDimensions: animatedCanvasDimensionsToDimensions(canvasDimensions),
      vertexRadius
    }),
    [viewDataContext.canvasDimensions, vertexRadius]
  );
  // Mapping between points from the source and target focus steps data
  const focusPath = useSharedValue<FocusPath<V>>({
    points: [],
    progressBounds: {
      from: {
        max: 1,
        min: 1
      },
      to: {
        max: 1,
        min: 1
      }
    }
  });
  // Path transition progress (used to transition from the current to the
  // target focus path)
  const pathTransitionProgress = useSharedValue(0);

  // TODO - clamp progress to [0, 1]

  // OTHER VALUES

  // // Used to determine the direction of the progress
  // const previousProgress = useSharedValue(0);
  // const previousStepIdx = useSharedValue(-1);
  // const syncProgress = useSharedValue(0);

  // State machine
  const stateMachine = useStateMachine(focusContext, viewDataContext, settings);

  const updatePath = () => {
    'worklet';
    // previousStepIdx.value = binarySearchLE(
    //   targetStepsData.value,
    //   settings.progress.value,
    //   ({ startsAt }) => startsAt
    // );
    const targetStepsData = createFocusSteps(
      sortedFocusPoints.value,
      verticesData
    );
    updateFocusPath(
      focusPath,
      pathTransitionProgress,
      targetStepsData,
      focusConfig.value,
      settings
    );
  };

  // // Enable/disable the state machine
  // const isGestureActive = viewDataContext.isGestureActive;
  // useAnimatedReaction(
  //   () => isVertexFocused.value || isGestureActive.value,
  //   disabled => { // TODO - fix double tap issue
  //     if (disabled) {
  //       if (!stateMachine.isStopped()) {
  //         stateMachine.stop();
  //         syncProgress.value = 0;
  //         previousProgress.value = 0;
  //       }
  //     } else if (stateMachine.isStopped()) {
  //       stateMachine.start();
  //       syncProgress.value = withTiming(1, DEFAULT_FOCUS_ANIMATION_SETTINGS);
  //     }
  //   }
  // );

  // Update focus steps data when focus points change
  useAnimatedReaction(
    () => sortedFocusPoints.value,
    () => {
      if (stateMachine.isStopped()) return;
      updatePath();
    }
  );

  // Update focus steps data when at least one focused vertex changes
  useAnimatedReaction(
    () => null,
    () => {
      if (stateMachine.isStopped()) return;
      // Check if focused vertices have changed
      const pathPoints = focusPath.value.points;
      const focusPoints = sortedFocusPoints.value;
      let i = 0;
      for (const {
        point: { key }
      } of focusPoints) {
        if (pathPoints[i++]?.to?.vertex !== verticesData[key]) {
          updatePath();
          return;
        }
      }
    },
    [verticesData]
  );

  // // Update focus on progress change or steps change
  // const focusProgress = settings.progress;
  // useAnimatedReaction(
  //   // TODO - react on vertex position changes when progress is not being modified
  //   () => ({
  //     progress: {
  //       current: focusProgress.value,
  //       previous: previousProgress.value,
  //       sync: syncProgress.value
  //     },
  //     steps: focusStepsData.value
  //   }),
  //   ({ progress, steps }) => {
  //     const prevStepIdx = previousStepIdx.value;
  //     if (
  //       stateMachine.isStopped() ||
  //       prevStepIdx === -1 ||
  //       progress.current === progress.previous
  //     ) {
  //       return;
  //     }

  //     const currentSteps = getFocusSteps(progress.current, prevStepIdx, steps);
  //     if (!currentSteps) return;
  //     const { afterStep, beforeStep, currentStepIdx } = currentSteps;

  //     // Update the state machine
  //     stateMachine.update(
  //       progress.current,
  //       progress.previous,
  //       progress.sync,
  //       beforeStep,
  //       afterStep,
  //       vertexRadius
  //     );

  //     // Update values for the next reaction
  //     previousProgress.value = progress.current;
  //     previousStepIdx.value = currentStepIdx;
  //   }
  // );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(MultiStepVertexFocusProvider, ({ verticesData }) => ({
    verticesData
  })),
  ({ componentSettings, focusSettings }) => ({
    settings: focusSettings,
    vertexRadius: componentSettings.vertex.radius
  })
);
