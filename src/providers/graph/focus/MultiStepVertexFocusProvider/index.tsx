import { PropsWithChildren } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DEFAULT_FOCUS_SETTINGS } from '@/configs/graph';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { useVertexFocusContext } from '@/providers/graph/focus/VertexFocusProvider';
import { FocusConfig, FocusPath, VertexComponentData } from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';
import { binarySearchLE } from '@/utils/algorithms';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { useStateMachine } from './StateMachine';
import {
  calcStepStartsAt,
  createFocusSteps,
  transformFocusData,
  updateFocusPath
} from './utils';

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
  const { isVertexFocused } = useVertexFocusContext();

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
  const previousProgress = useSharedValue(0);
  const afterStepIdx = useSharedValue(0);
  // const syncProgress = useSharedValue(0);

  // State machine
  const stateMachine = useStateMachine(focusContext, viewDataContext, settings);

  const updatePath = () => {
    'worklet';
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
    // Set the after step index (based on the current progress)
    afterStepIdx.value =
      binarySearchLE(focusPath.value.points, settings.progress.value, mapping =>
        calcStepStartsAt(
          focusPath.value.progressBounds,
          pathTransitionProgress.value,
          mapping,
          'min'
        )
      ) + 1;
  };

  // Enable/disable the state machine
  const isGestureActive = viewDataContext.isGestureActive;
  useAnimatedReaction(
    () => isVertexFocused.value || isGestureActive.value,
    disabled => {
      // TODO - fix double tap issue
      if (disabled) {
        if (!stateMachine.isStopped()) {
          stateMachine.stop();
          // syncProgress.value = 0; // TODO - fix sync progress
          previousProgress.value = 0;
        }
      } else if (stateMachine.isStopped()) {
        stateMachine.start();
        // syncProgress.value = withTiming(1, DEFAULT_FOCUS_ANIMATION_SETTINGS);
      }
    }
  );

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

  // Update focus on progress change or steps change
  const focusProgress = settings.progress;
  useAnimatedReaction(
    // TODO - react on vertex position changes when progress is not being modified
    () => ({
      progress: {
        current: focusProgress.value,
        transition: pathTransitionProgress.value
        // sync: syncProgress.value
      }
    }),
    ({ progress }) => {
      if (stateMachine.isStopped()) {
        return;
      }
      const afterIdx = afterStepIdx.value;
      const currentData = transformFocusData(
        focusPath.value,
        progress,
        afterIdx,
        focusConfig.value
      );
      if (!currentData) return;

      console.log(currentData?.pointsTransitionProgress);
      // Update the state machine
      stateMachine.update(
        currentData,
        {
          current: progress.current,
          previous: previousProgress.value
        },
        1 // TODO - add sync progress
        // progress.sync,
      );
      // Update values for the next reaction
      previousProgress.value = progress.current;
      afterStepIdx.value = Math.max(0, currentData.afterStepIdx);
    }
  );

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
