import { Canvas, Group, Vector } from '@shopify/react-native-skia';
import {
  Children,
  cloneElement,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import ViewControls from '@/components/controls/ViewControls';
import { GraphComponentPrivateProps } from '@/components/graphs/GraphComponent';
import {
  AUTO_LAYOUT_TIMEOUT,
  DEFAULT_SCALES,
  INITIAL_SCALE
} from '@/constants/views';
import { useGraphEventsContext } from '@/context/graphEvents';
import { Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { canvasCoordinatesToContainerCoordinates } from '@/utils/coordinates';
import { fixedWithDecay } from '@/utils/reanimated';
import {
  calcContainerScale,
  calcContainerTranslation,
  calcScaleOnProgress,
  calcTranslationOnProgress,
  clamp
} from '@/utils/views';

type PannableScalableViewProps = PropsWithChildren<{
  scales?: number[];
  initialScale?: number;
  objectFit?: ObjectFit;
  autoLayoutTimeout?: number;
  controls?: boolean;
}>;

export default function PannableScalableView<V, E>({
  children,
  scales = DEFAULT_SCALES,
  initialScale = INITIAL_SCALE,
  objectFit = 'none',
  autoLayoutTimeout = AUTO_LAYOUT_TIMEOUT,
  controls = false
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

  // CONTEXT
  const graphEventsContext = useGraphEventsContext();

  // CANVAS
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);

  // CONTAINER
  const containerTop = useSharedValue(0);
  const containerLeft = useSharedValue(0);
  const containerRight = useSharedValue(0);
  const containerBottom = useSharedValue(0);
  // Dimensions
  const initialContainerDimensionsRef = useRef<Dimensions | null>(null);
  const containerWidth = useDerivedValue(
    () => containerRight.value - containerLeft.value,
    [containerRight, containerLeft]
  );
  const containerHeight = useDerivedValue(
    () => containerBottom.value - containerTop.value,
    [containerBottom, containerTop]
  );

  // CONTAINER SCALE
  const scaleValues = useMemo(() => [...scales].sort(), [scales]);
  const currentScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);

  // AUTO LAYOUT
  const autoLayoutEnabled = useSharedValue(false);
  // Transition between non-auto-layout and auto-layout states
  const autoLayoutTransitionProgress = useSharedValue(0);
  const autoLayoutStartScale = useSharedValue<number>(0);
  const autoLayoutStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const autoLayoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        layout: { width, height }
      }
    }: LayoutChangeEvent) => {
      canvasWidth.value = width;
      canvasHeight.value = height;

      if (initialContainerDimensionsRef.current) {
        resetContentPosition({
          canvasDimensions: {
            width,
            height
          },
          containerDimensions: initialContainerDimensionsRef.current
        });
      }
    },
    []
  );

  const handleGraphRender = useCallback((containerDimensions: Dimensions) => {
    initialContainerDimensionsRef.current ??= containerDimensions;
    resetContentPosition({
      containerDimensions
    });
  }, []);

  const resetContentPosition = useCallback(
    (settings?: {
      containerDimensions?: Dimensions;
      canvasDimensions?: Dimensions;
      animated?: boolean;
    }) => {
      const containerDimensions = settings?.containerDimensions ?? {
        width: containerWidth.value || 0,
        height: containerHeight.value || 0
      };

      const canvasDimensions = settings?.canvasDimensions ?? {
        width: canvasWidth.value,
        height: canvasHeight.value
      };

      disableAutoLayout();

      const scale = clamp(
        calcContainerScale('contain', containerDimensions, canvasDimensions),
        [minScale, maxScale]
      );
      scaleContentTo(scale, undefined, settings?.animated);
      translateContentTo(
        {
          x: canvasDimensions.width / 2,
          y: canvasDimensions.height / 2
        },
        undefined,
        settings?.animated
      );

      startAutoLayoutTimeout();
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

  const startAutoLayoutTimeout = () => {
    clearAutoLayoutTimeout();
    autoLayoutTimeoutRef.current = setTimeout(() => {
      autoLayoutTimeoutRef.current = null;
      autoLayoutEnabled.value = true;
      autoLayoutTransitionProgress.value = withTiming(1, {
        duration: 150,
        easing: Easing.ease
      });
      autoLayoutStartScale.value = currentScale.value;
      autoLayoutStartTranslation.value = {
        x: translateX.value,
        y: translateY.value
      };
    }, autoLayoutTimeout);
  };

  const clearAutoLayoutTimeout = () => {
    if (autoLayoutTimeoutRef.current) {
      clearTimeout(autoLayoutTimeoutRef.current);
      autoLayoutTimeoutRef.current = null;
    }
  };

  const disableAutoLayout = () => {
    autoLayoutEnabled.value = false;
    autoLayoutTransitionProgress.value = withTiming(0, {
      duration: 150,
      easing: Easing.ease
    });
    clearAutoLayoutTimeout();
  };

  useAnimatedReaction(
    () => ({
      top: containerTop.value,
      left: containerLeft.value,
      containerDimensions: {
        width: containerWidth.value,
        height: containerHeight.value
      },
      canvasDimensions: {
        width: canvasWidth.value,
        height: canvasHeight.value
      },
      enabled: autoLayoutEnabled.value,
      startScale: autoLayoutStartScale.value,
      startTranslation: autoLayoutStartTranslation.value,
      transitionProgress: autoLayoutTransitionProgress.value
    }),
    ({
      top,
      left,
      containerDimensions,
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
              containerDimensions,
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
          calcContainerTranslation(
            objectFit,
            top,
            left,
            containerDimensions,
            canvasDimensions
          )
        )
      );
    },
    [objectFit]
  );

  const panGestureHandler = Gesture.Pan()
    .onStart(() => {
      runOnJS(disableAutoLayout)();
    })
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
      runOnJS(startAutoLayoutTimeout)();
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
      runOnJS(disableAutoLayout)();
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
      runOnJS(startAutoLayoutTimeout)();
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(disableAutoLayout)();
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
      runOnJS(startAutoLayoutTimeout)();
    });

  const handlePress = (
    { x, y }: Vector,
    pressHandler?: (position: Vector) => void
  ) => {
    'worklet';
    if (pressHandler) {
      runOnJS(pressHandler)(
        canvasCoordinatesToContainerCoordinates(
          { x, y },
          { x: translateX.value, y: translateY.value },
          currentScale.value
        )
      );
    }
  };

  const pressGestureHandler = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(({ x, y }) =>
      handlePress({ x, y }, graphEventsContext?.handlePress)
    );

  const longPressGestureHandler = Gesture.LongPress().onEnd(({ x, y }) =>
    handlePress({ x, y }, graphEventsContext?.handleLongPress)
  );

  const canvasGestureHandler = Gesture.Race(
    Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
    doubleTapGestureHandler
  );

  const gestureHandler = graphEventsContext
    ? Gesture.Exclusive(
        canvasGestureHandler,
        pressGestureHandler,
        longPressGestureHandler
      )
    : canvasGestureHandler;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gestureHandler}>
        <Canvas style={styles.canvas} onLayout={handleCanvasRender}>
          <Group transform={transform}>
            {Children.map(children, child => {
              const childElement = child as ReactElement<
                GraphComponentPrivateProps<V, E>
              >;
              return cloneElement(childElement, {
                boundingRect: {
                  left: containerLeft,
                  right: containerRight,
                  top: containerTop,
                  bottom: containerBottom
                },
                onRender: handleGraphRender,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                graphEventsContext: graphEventsContext!
              });
            })}
          </Group>
        </Canvas>
      </GestureDetector>
      {controls && (
        <ViewControls
          onReset={() => resetContentPosition({ animated: true })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  canvas: {
    flex: 1
  }
});
