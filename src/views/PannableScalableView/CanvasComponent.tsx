import { Canvas, Group, Transforms2d } from '@shopify/react-native-skia';
import { Children, cloneElement, PropsWithChildren, ReactElement } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

import { GraphComponentProps } from '@/components/graphs/GraphComponent';
import {
  AccessibleOverlayContextType,
  withOverlay
} from '@/contexts/OverlayProvider';

type CanvasComponentProps = PropsWithChildren<{
  graphComponentProps: GraphComponentProps;
  onRender: (event: LayoutChangeEvent) => void;
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  transform: SharedValue<Transforms2d>;
}>;

function CanvasComponent({
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
            GraphComponentProps & AccessibleOverlayContextType
          >;
          return cloneElement(childElement, {
            removeLayer,
            renderLayer,
            ...graphComponentProps
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
