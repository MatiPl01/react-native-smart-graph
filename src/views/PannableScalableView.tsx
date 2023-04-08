import { styled } from 'nativewind';
import {
  Children,
  PropsWithChildren,
  cloneElement,
  useCallback,
  useRef
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming
} from 'react-native-reanimated';

import { Canvas, Group } from '@shopify/react-native-skia';

import ViewControls from '@/components/controls/ViewControls';
import {
  MeasureEvent,
  TestGraphPrivateProps
} from '@/components/graphs/TestGraph';
import { Dimensions, ObjectFit } from '@/types/views';
import {
  clamp,
  getCenterInParent,
  getScaleInParent
} from '@/utils/views';

const StyledCanvas = styled(Canvas, 'grow');

type PannableScalableViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  objectFit?: ObjectFit;
  className?: string;
  controls?: boolean;
}>;

export default function PannableScalableView({
  minScale = 0.25,
  maxScale = 10,
  objectFit = 'none',
  className,
  children,
  controls = false
}: PannableScalableViewProps) {
  const isRenderedRef = useRef({ canvas: false, content: false });
  const minScaleRef = useRef(minScale);
  const maxScaleRef = useRef(maxScale);

  const canvasDimensions = useSharedValue({ width: 0, height: 0 });
  const contentDimensions = useSharedValue({ width: 0, height: 0 });
  const initialScale = useSharedValue(0);

  const startScale = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const transform = useDerivedValue(
    () => [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    [translateX, translateY, scale]
  );

  const handleCanvasRender = useCallback(
    ({
      nativeEvent: {
        layout: { width, height }
      }
    }: LayoutChangeEvent) => {
      canvasDimensions.value = { width, height };
      isRenderedRef.current.canvas = true;

      if (isRenderedRef.current.content) {
        updateContentPosition(contentDimensions.value, { width, height });
      }
    },
    []
  );

  const handleContentMeasure = useCallback(
    ({ layout: { width, height } }: MeasureEvent) => {
      isRenderedRef.current.content = true;
      contentDimensions.value = { width, height };

      if (isRenderedRef.current.canvas) {
        updateContentPosition({ width, height }, canvasDimensions.value);
      }
    },
    []
  );

  const updateContentPosition = useCallback(
    (contentDims: Dimensions, canvasDims: Dimensions, animated?: boolean) => {
      const { scale: renderedScale, dimensions: renderedDimensions } =
        getScaleInParent(objectFit, contentDims, canvasDims);

      initialScale.value = renderedScale;
      scaleContentTo(renderedScale, undefined, animated);

      translateContentTo(
        getCenterInParent(renderedDimensions, canvasDims),
        undefined,
        animated
      );
    },
    [objectFit]
  );

  const handleReset = useCallback(() => {
    updateContentPosition(
      contentDimensions.value,
      canvasDimensions.value,
      true
    );
  }, []);

  const translateContentTo = (
    translate: { x: number; y: number },
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animated?: boolean
  ) => {
    'worklet';
    const timingConfig = { duration: 150, easing: Easing.ease };

    const newTranslateX = clampTo?.x
      ? clamp(translate.x, clampTo.x)
      : translate.x;
    const newTranslateY = clampTo?.y
      ? clamp(translate.y, clampTo.y)
      : translate.y;

    if (animated) {
      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const translateWithDecay = (
    velocity: number,
    position: number,
    clampSize: number
  ) => {
    'worklet';
    let newVelocity = velocity;
    if (position < Math.min(0, clampSize) && velocity > 0) {
      newVelocity = -0.01;
    } else if (position > Math.max(0, clampSize) && velocity < 0) {
      newVelocity = 0.01;
    }

    return withDecay({
      velocity: newVelocity,
      clamp: [Math.min(0, clampSize), Math.max(0, clampSize)],
      rubberBandEffect: true,
      deceleration: 0.98,
      rubberBandFactor: 3
    });
  };

  const scaleContentTo = (
    newScale: number,
    origin?: { x: number; y: number },
    animated = false
  ) => {
    'worklet';
    const timingConfig = { duration: 150, easing: Easing.ease };
    const clampedScale = clamp(newScale, [
      minScaleRef.current,
      maxScaleRef.current
    ]);

    if (origin) {
      const relativeScale = clampedScale / scale.value;
      const { width: contentWidth, height: contentHeight } =
        contentDimensions.value;
      const { width: canvasWidth, height: canvasHeight } =
        canvasDimensions.value;

      const clampWidth = canvasWidth - contentWidth * clampedScale;
      const clampHeight = canvasHeight - contentHeight * clampedScale;

      translateContentTo(
        {
          x:
            translateX.value -
            (origin.x - translateX.value) * (relativeScale - 1),
          y:
            translateY.value -
            (origin.y - translateY.value) * (relativeScale - 1)
        },
        {
          x: [Math.min(0, clampWidth), Math.max(0, clampWidth)],
          y: [Math.min(0, clampHeight), Math.max(0, clampHeight)]
        },
        animated
      );
    }

    if (animated) {
      scale.value = withTiming(clampedScale, timingConfig);
    } else {
      scale.value = clampedScale;
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      translateX.value = translateWithDecay(
        velocityX,
        translateX.value,
        canvasDimensions.value.width -
          contentDimensions.value.width * scale.value
      );
      translateY.value = translateWithDecay(
        velocityY,
        translateY.value,
        canvasDimensions.value.height -
          contentDimensions.value.height * scale.value
      );
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onChange(e => {
      scaleContentTo(startScale.value * e.scale, { x: e.focalX, y: e.focalY });
    })
    .onEnd(e => {
      scale.value = withDecay({
        velocity: e.velocity,
        clamp: [minScaleRef.current, maxScaleRef.current],
        rubberBandEffect: true
      });
    });

  const tapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(({ x, y }) => {
      const origin = { x, y };
      const halfScale = (maxScaleRef.current + minScaleRef.current) / 2;

      if (scale.value < initialScale.value) {
        scaleContentTo(initialScale.value, origin, true);
      } else if (scale.value < halfScale) {
        scaleContentTo(halfScale, origin, true);
      } else if (scale.value < maxScaleRef.current) {
        scaleContentTo(maxScaleRef.current, origin, true);
      } else {
        scaleContentTo(initialScale.value, origin, true);
      }
    });

  return (
    <View className='grow relative overflow-hidden'>
      <GestureDetector
        gesture={Gesture.Race(
          Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
          tapGestureHandler
        )}>
        <StyledCanvas className={className} onLayout={handleCanvasRender}>
          <Group transform={transform}>
            {Children.map(children, child => {
              const childElement =
                child as React.ReactElement<TestGraphPrivateProps>;
              return cloneElement(childElement, {
                onMeasure: handleContentMeasure
              });
            })}
          </Group>
        </StyledCanvas>
      </GestureDetector>
      {controls && <ViewControls onReset={handleReset} />}
    </View>
  );
}
