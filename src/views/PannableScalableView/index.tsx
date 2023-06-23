import { Vector } from '@shopify/react-native-skia';
import React, {
  memo,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import ViewControls from '@/components/controls/ViewControls';
import {
  AUTO_SIZING_TIMEOUT,
  DEFAULT_SCALES,
  INITIAL_SCALE
} from '@/constants/views';
import OverlayProvider, { OverlayOutlet } from '@/contexts/OverlayProvider';
import { BoundingRect, Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { deepMemoComparator } from '@/utils/equality';
import { fixedWithDecay } from '@/utils/reanimated';
import {
  calcContainerScale,
  calcContainerTranslation,
  calcScaleOnProgress,
  calcTranslationOnProgress,
  clamp
} from '@/utils/views';

import CanvasComponent from './CanvasComponent';

type PannableScalableViewProps = PropsWithChildren<{
  autoSizingTimeout?: number;
  controls?: boolean;
  initialScale?: number;
  objectFit?: ObjectFit;
  scales?: number[];
}>;

function PannableScalableView({
  autoSizingTimeout = AUTO_SIZING_TIMEOUT,
  children,
  controls = false,
  initialScale = INITIAL_SCALE,
  objectFit = 'none',
  scales = DEFAULT_SCALES
}: PannableScalableViewProps) {
  // Validate parameters
  if (scales.length === 0) {
    throw new Error('At least one scale must be provided');
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const minScale = scales[0]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const maxScale = scales[scales.length - 1]!;
  const initialScaleIndex = scales.indexOf(initialScale);
  if (initialScaleIndex < 0) {
    throw new Error('Initial scale must be included in scales');
  }

  // CANVAS
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);

  // CONTAINER
  const containerTop = useSharedValue(0);
  const containerLeft = useSharedValue(0);
  const containerRight = useSharedValue(0);
  const containerBottom = useSharedValue(0);
  // Bounding rect
  const initialBoundingRectRef = useRef<BoundingRect | null>(null);
  // Scale
  const scaleValues = useMemo(() => [...scales].sort(), [scales]);
  const currentScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);

  // AUTO SIZING
  const autoSizingEnabled = useSharedValue(true);
  // Transition between non-auto-layout and auto-layout states
  const autoSizingTransitionProgress = useSharedValue(1);
  const autoSizingStartScale = useSharedValue<number>(0);
  const autoSizingStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const autoSizingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // CONTAINER TRANSFORM
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const transform = useDerivedValue(
    () => [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: currentScale.value }
    ],
    [translateX, translateY, currentScale]
  );

  const handleCanvasRender = useCallback(
    ({
      nativeEvent: {
        layout: { height, width }
      }
    }: LayoutChangeEvent) => {
      canvasWidth.value = width;
      canvasHeight.value = height;

      if (initialBoundingRectRef.current) {
        resetContainerPosition(
          {
            canvasDimensions: {
              height,
              width
            },
            containerBoundingRect: initialBoundingRectRef.current
          },
          false
        );
      }
    },
    []
  );

  const handleGraphRender = useCallback(
    (containerBoundingRect: BoundingRect) => {
      initialBoundingRectRef.current ??= containerBoundingRect;
      resetContainerPosition(
        {
          containerBoundingRect
        },
        false
      );
    },
    []
  );

  const resetContainerPosition = useCallback(
    (
      settings?: {
        animated?: boolean;
        canvasDimensions?: Dimensions;
        containerBoundingRect?: BoundingRect;
      },
      userTriggered = true
    ) => {
      const containerBoundingRect = settings?.containerBoundingRect ?? {
        bottom: containerBottom.value,
        left: containerLeft.value,
        right: containerRight.value,
        top: containerTop.value
      };

      const canvasDimensions = settings?.canvasDimensions ?? {
        height: canvasHeight.value,
        width: canvasWidth.value
      };

      if (userTriggered) disableAutoSizing();

      const scale = clamp(
        calcContainerScale(
          'contain',
          {
            height: containerBoundingRect.bottom - containerBoundingRect.top,
            width: containerBoundingRect.right - containerBoundingRect.left
          },
          canvasDimensions
        ),
        [minScale, maxScale]
      );
      scaleContentTo(scale, undefined, settings?.animated);
      translateContentTo(
        calcContainerTranslation(
          objectFit,
          containerBoundingRect,
          canvasDimensions
        ),
        undefined,
        settings?.animated
      );

      if (userTriggered) startAutoSizingTimeout();
    },
    [objectFit]
  );

  const getTranslateClamp = (
    scale: number
  ): {
    x: [number, number];
    y: [number, number];
  } => {
    'worklet';

    return {
      x: [
        Math.min(
          -containerLeft.value * scale,
          canvasWidth.value - containerRight.value * scale
        ),
        Math.max(
          canvasWidth.value - containerRight.value * scale,
          -containerLeft.value * scale
        )
      ],
      y: [
        Math.min(
          -containerTop.value * scale,
          canvasHeight.value - containerBottom.value * scale
        ),
        Math.max(
          canvasHeight.value - containerBottom.value * scale,
          -containerTop.value * scale
        )
      ]
    };
  };

  const translateContentTo = (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animated?: boolean
  ) => {
    'worklet';

    const newTranslateX = clampTo?.x
      ? clamp(translate.x, clampTo.x)
      : translate.x;
    const newTranslateY = clampTo?.y
      ? clamp(translate.y, clampTo.y)
      : translate.y;

    if (animated) {
      const timingConfig = { duration: 150, easing: Easing.ease };

      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Vector,
    animated = false
  ) => {
    'worklet';
    if (origin) {
      const relativeScale = newScale / currentScale.value;

      translateContentTo(
        {
          x:
            translateX.value -
            (origin.x - translateX.value) * (relativeScale - 1),
          y:
            translateY.value -
            (origin.y - translateY.value) * (relativeScale - 1)
        },
        getTranslateClamp(newScale),
        animated
      );
    }

    if (animated) {
      currentScale.value = withTiming(newScale, {
        duration: 150,
        easing: Easing.ease
      });
    } else {
      currentScale.value = newScale;
    }
  };

  const startAutoSizingTimeout = () => {
    clearAutoSizingTimeout();
    autoSizingTimeoutRef.current = setTimeout(() => {
      autoSizingTimeoutRef.current = null;
      autoSizingEnabled.value = true;
      autoSizingTransitionProgress.value = withTiming(1, {
        duration: 150,
        easing: Easing.ease
      });
      autoSizingStartScale.value = currentScale.value;
      autoSizingStartTranslation.value = {
        x: translateX.value,
        y: translateY.value
      };
    }, autoSizingTimeout);
  };

  const clearAutoSizingTimeout = () => {
    if (autoSizingTimeoutRef.current) {
      clearTimeout(autoSizingTimeoutRef.current);
      autoSizingTimeoutRef.current = null;
    }
  };

  const disableAutoSizing = () => {
    autoSizingEnabled.value = false;
    autoSizingTransitionProgress.value = withTiming(0, {
      duration: 150,
      easing: Easing.ease
    });
    clearAutoSizingTimeout();
  };

  useAnimatedReaction(
    () => ({
      boundingRect: {
        bottom: containerBottom.value,
        left: containerLeft.value,
        right: containerRight.value,
        top: containerTop.value
      },
      canvasDimensions: {
        height: canvasHeight.value,
        width: canvasWidth.value
      },
      enabled: autoSizingEnabled.value,
      startScale: autoSizingStartScale.value,
      startTranslation: autoSizingStartTranslation.value,
      transitionProgress: autoSizingTransitionProgress.value
    }),
    ({
      boundingRect,
      canvasDimensions,
      enabled,
      startScale,
      startTranslation,
      transitionProgress
    }) => {
      // Don't auto scale if it's disabled
      if (!enabled || objectFit === 'none') return;
      // Scale content to fit container based on objectFit
      scaleContentTo(
        calcScaleOnProgress(
          transitionProgress,
          startScale,
          clamp(
            calcContainerScale(
              objectFit,
              {
                height: boundingRect.bottom - boundingRect.top,
                width: boundingRect.right - boundingRect.left
              },
              canvasDimensions
            ),
            [minScale, maxScale]
          )
        )
      );
      // Translate content to fit container based on objectFit
      translateContentTo(
        calcTranslationOnProgress(
          transitionProgress,
          startTranslation,
          calcContainerTranslation(objectFit, boundingRect, canvasDimensions)
        )
      );
    },
    [objectFit]
  );

  const panGestureHandler = Gesture.Pan()
    .onStart(() => {
      runOnJS(disableAutoSizing)();
    })
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
      runOnJS(startAutoSizingTimeout)();
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
      runOnJS(disableAutoSizing)();
    })
    .onChange(e => {
      scaleContentTo(pinchStartScale.value * e.scale, {
        x: e.focalX,
        y: e.focalY
      });
    })
    .onEnd(e => {
      currentScale.value = fixedWithDecay(e.velocity, currentScale.value, [
        minScale,
        maxScale
      ]);
      runOnJS(startAutoSizingTimeout)();
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(disableAutoSizing)();
    })
    .onEnd(({ x, y }) => {
      const origin = { x, y };

      if (currentScale.value === maxScale) {
        scaleContentTo(initialScale, origin, true);
      } else {
        // Find first scale that is bigger than current scale
        const newScale = scaleValues.find(scale => scale > currentScale.value);
        scaleContentTo(newScale ?? maxScale, origin, true);
      }
      runOnJS(startAutoSizingTimeout)();
    });

  const canvasGestureHandler = Gesture.Race(
    Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
    doubleTapGestureHandler
  );

  return (
    <View style={styles.container}>
      <OverlayProvider>
        <CanvasComponent
          boundingRect={{
            bottom: containerBottom,
            left: containerLeft,
            right: containerRight,
            top: containerTop
          }}
          graphComponentProps={{
            onRender: handleGraphRender
          }}
          onRender={handleCanvasRender}
          transform={transform}>
          {children}
        </CanvasComponent>
        {/* Renders overlay layers set using the OverlayContext */}
        <OverlayOutlet gesture={canvasGestureHandler} />
      </OverlayProvider>
      {controls && (
        <ViewControls
          onReset={() => resetContainerPosition({ animated: true })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  }
});

// Rerender only on prop changes
export default memo(
  PannableScalableView,
  deepMemoComparator({
    // shallow compare the graph object property of the child component
    // to prevent deep checking a large graph model structure
    // (graph should be memoized using the useMemo hook to prevent
    // unnecessary rerenders)
    shallow: ['children.graph']
  })
) as typeof PannableScalableView;
