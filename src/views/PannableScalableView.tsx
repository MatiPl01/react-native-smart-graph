import { styled } from 'nativewind';
import {
  Children,
  PropsWithChildren,
  ReactElement,
  cloneElement,
  useCallback,
  useRef
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { Canvas, Group, Vector } from '@shopify/react-native-skia';

import ViewControls from '@/components/controls/ViewControls';
import { GraphComponentPrivateProps } from '@/components/graphs/GraphComponent';
import { useGraphEventsContext } from '@/context/graphEvents';
import { Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { canvasCoordinatesToContainerCoordinates } from '@/utils/canvas';
import { fixedWithDecay } from '@/utils/reanimated';
import { clamp, getScaleInParent } from '@/utils/views';

const StyledCanvas = styled(Canvas, 'grow');

type PannableScalableViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  objectFit?: ObjectFit;
  className?: string;
  controls?: boolean;
}>;

export default function PannableScalableView<V, E>({
  minScale = 0.25, // TODO - improve scales
  maxScale = 10,
  objectFit = 'none',
  className,
  children,
  controls = false
}: PannableScalableViewProps) {
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
  const renderScale = useSharedValue(1);
  const currentScale = useSharedValue(0.25);
  const pinchStartScale = useSharedValue(1);

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

      const { scale: renderedScale } = getScaleInParent(
        objectFit,
        containerDimensions,
        canvasDimensions
      );

      renderScale.value = renderedScale;
      scaleContentTo(renderedScale, undefined, settings?.animated);

      translateContentTo(
        {
          x: canvasDimensions.width / 2,
          y: canvasDimensions.height / 2
        },
        undefined,
        settings?.animated
      );
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

  const panGestureHandler = Gesture.Pan()
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
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
    });

  const doubleTapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(({ x, y }) => {
      const origin = { x, y };
      const halfScale = (minScale + maxScale) / 2;

      if (currentScale.value < renderScale.value) {
        scaleContentTo(renderScale.value, origin, true);
      } else if (currentScale.value < halfScale) {
        scaleContentTo(halfScale, origin, true);
      } else if (currentScale.value < maxScale) {
        scaleContentTo(maxScale, origin, true);
      } else {
        scaleContentTo(renderScale.value, origin, true);
      }
    });

  const handlePress = useCallback(
    ({ x, y }: Vector, pressHandler?: (position: Vector) => void) => {
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
    },
    []
  );

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
    <View className='grow relative overflow-hidden'>
      <GestureDetector gesture={gestureHandler}>
        <StyledCanvas className={className} onLayout={handleCanvasRender}>
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
                onRender: (containerDimensions: Dimensions) => {
                  initialContainerDimensionsRef.current ??= containerDimensions;
                  resetContentPosition({
                    containerDimensions
                  });
                },
                setAnimatedVerticesPositions:
                  graphEventsContext?.setAnimatedVerticesPositions,
                setGraphSettings: graphEventsContext?.setGraphSettings,
                setGraphModel: graphEventsContext?.setGraphModel
              });
            })}
          </Group>
        </StyledCanvas>
      </GestureDetector>
      {controls && (
        <ViewControls
          onReset={() => resetContentPosition({ animated: true })}
        />
      )}
    </View>
  );
}
