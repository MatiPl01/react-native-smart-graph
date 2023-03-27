import { styled } from 'nativewind';
import { Children, PropsWithChildren, cloneElement, useCallback } from 'react';
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
import { Dimensions, ObjectFit } from '@/types/views.types';
import { getCenterInParent, getScaleInParent } from '@/utils/views.utils';

const StyledCanvas = styled(Canvas, 'grow');

type PannableScalableViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  objectFit?: ObjectFit;
  className?: string;
  controls?: boolean;
}>;

export default function PannableScalableView({
  minScale = 0.25, // TODO
  maxScale = 10, // TODO
  objectFit = 'none',
  className,
  children,
  controls = false
}: PannableScalableViewProps) {
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
      updateContentPosition(contentDimensions.value, { width, height });
    },
    []
  );

  const handleContentMeasure = useCallback(
    ({ layout: { width, height } }: MeasureEvent) => {
      contentDimensions.value = { width, height };
      updateContentPosition({ width, height }, canvasDimensions.value);
    },
    []
  );

  // TODO - fx centering not always working (race condition?)
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

  const clamp = (value: number, bounds: [number, number]) => {
    'worklet';
    return Math.min(Math.max(value, bounds[0]), bounds[1]);
  };

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

  const scaleContentTo = (
    newScale: number,
    origin?: { x: number; y: number },
    animated = true
  ) => {
    'worklet';
    const timingConfig = { duration: 150, easing: Easing.ease };
    const clampedScale = clamp(newScale, [minScale, maxScale]);

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
    .onEnd(e => {
      const clampWidth =
        canvasDimensions.value.width -
        contentDimensions.value.width * scale.value;
      const clampHeight =
        canvasDimensions.value.height -
        contentDimensions.value.height * scale.value;

      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [Math.min(0, clampWidth), Math.max(0, clampWidth)],
        rubberBandEffect: true
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [Math.min(0, clampHeight), Math.max(0, clampHeight)],
        rubberBandEffect: true
      });
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onChange(e => {
      scaleContentTo(
        startScale.value * e.scale,
        { x: e.focalX, y: e.focalY },
        false
      );
    })
    .onEnd(e => {
      scale.value = withDecay({
        velocity: e.velocity,
        clamp: [minScale, maxScale],
        rubberBandEffect: true
      });
    });

  const tapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(({ x, y }) => {
      const origin = { x, y };
      const halfScale = (maxScale + minScale) / 2;

      if (scale.value < initialScale.value) {
        scaleContentTo(initialScale.value, origin);
      } else if (scale.value < halfScale) {
        scaleContentTo(halfScale, origin);
      } else if (scale.value < maxScale) {
        scaleContentTo(maxScale, origin);
      } else {
        scaleContentTo(initialScale.value, origin);
      }
    });

  return (
    <View className='grow relative'>
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
