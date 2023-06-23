import { Canvas, Group, Transforms2d } from '@shopify/react-native-skia';
import { Children, cloneElement, PropsWithChildren, ReactElement } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

import { GraphComponentProps } from '@/components/graphs/GraphComponent';
import { withOverlay } from '@/contexts/OverlayProvider';
import { GraphProviderAdditionalProps } from '@/providers/GraphProvider';
import { AnimatedBoundingRect } from '@/types/layout';

type CanvasComponentProps = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  graphComponentProps: GraphComponentProps;
  onRender: (event: LayoutChangeEvent) => void;
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  transform: SharedValue<Transforms2d>;
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
  return (
    <Canvas onLayout={onRender} style={styles.canvas}>
      <Group transform={transform}>
        {Children.map(children, child => {
          const childElement = child as ReactElement<
            {
              graphComponentProps: GraphComponentProps;
            } & GraphProviderAdditionalProps
          >;
          return cloneElement(childElement, {
            boundingRect,
            graphComponentProps,
            removeLayer,
            renderLayer
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
