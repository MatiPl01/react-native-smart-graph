import { Canvas, Group } from '@shopify/react-native-skia';
import { Children, cloneElement, ReactElement } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { useGraphComponentContext } from '@/contexts/GraphComponentProvider';
import { withOverlay } from '@/contexts/OverlayProvider';
import {
  useCanvasDataContext,
  useFocusContext,
  useTransformContext
} from '@/providers/canvas';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { AnimatedBoundingRect } from '@/types/layout';

type CanvasComponentProps = {
  boundingRect: AnimatedBoundingRect;
  onRender: (event: LayoutChangeEvent) => void;
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  transform: AnimatedCanvasTransform;
};

function CanvasComponent({
  boundingRect,
  onRender,
  removeLayer,
  renderLayer,
  transform
}: CanvasComponentProps) {
  // CONTEXTS
  // Graph component context
  const { component } = useGraphComponentContext();
  console.log('CanvasComponent');
  // Canvas data context
  const { canvasDimensions, initialScale, scales } = useCanvasDataContext();
  // Transform context
  const { handleGraphRender } = useTransformContext();
  // Focus context
  const {
    endFocus,
    focusKey,
    focusStatus,
    focusTransitionProgress,
    startFocus
  } = useFocusContext();

  const containerTransform = useDerivedValue(() => [
    { translateX: transform.translateX.value },
    { translateY: transform.translateY.value },
    { scale: transform.scale.value }
  ]);

  return (
    <Canvas onLayout={onRender} style={styles.canvas}>
      <Group transform={containerTransform}>
        {Children.map(component, child => {
          const childElement =
            child as ReactElement<GraphProviderAdditionalProps>;
          return cloneElement(childElement, {
            boundingRect,
            canvasDimensions,
            canvasScales: scales,
            endFocus,
            focusKey,
            focusStatus,
            focusTransitionProgress,
            initialCanvasScale: initialScale,
            onRender: handleGraphRender,
            removeLayer,
            renderLayer,
            startFocus,
            transform
          });
        })}
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1
  }
});

export default withOverlay(CanvasComponent);
