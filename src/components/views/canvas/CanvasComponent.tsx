import { Canvas, Group } from '@shopify/react-native-skia';
import { Children, cloneElement, PropsWithChildren, ReactElement } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { GraphComponentProps } from '@/components/graphs/GraphComponent';
import { withOverlay } from '@/contexts/OverlayProvider';
import { useCanvasDataContext } from '@/providers/canvas';
import { useFocusContext } from '@/providers/canvas/transform';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { AnimatedBoundingRect } from '@/types/layout';

type CanvasComponentProps = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  graphComponentProps: GraphComponentProps;
  onRender: (event: LayoutChangeEvent) => void;
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  transform: AnimatedCanvasTransform;
}>;

function CanvasComponent({
  boundingRect,
  children,
  graphComponentProps,
  onRender,
  removeLayer,
  renderLayer,
  transform
}: CanvasComponentProps) {
  // CONTEXTS
  // Canvas data context
  const { canvasDimensions } = useCanvasDataContext();
  // Focus context
  const { setFocus } = useFocusContext();

  const containerTransform = useDerivedValue(() => [
    { translateX: transform.translateX.value },
    { translateY: transform.translateY.value },
    { scale: transform.scale.value }
  ]);

  return (
    <Canvas onLayout={onRender} style={styles.canvas}>
      <Group transform={containerTransform}>
        {Children.map(children, child => {
          const childElement = child as ReactElement<
            {
              graphComponentProps: GraphComponentProps;
            } & GraphProviderAdditionalProps
          >;
          return cloneElement(childElement, {
            boundingRect,
            canvasDimensions,
            graphComponentProps,
            removeLayer,
            renderLayer,
            setFocus,
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
