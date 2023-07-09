import { Canvas, Group } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { useGraphViewChildrenContext } from '@/contexts/GraphViewChildrenProvider';
import { useCanvasDataContext, useTransformContext } from '@/providers/canvas';

function CanvasComponent() {
  // CONTEXTS
  // GraphView children context
  const { canvasChildren } = useGraphViewChildrenContext();
  // Canvas data context
  const { currentScale, currentTranslation } = useCanvasDataContext();
  // Transform context
  const { handleCanvasRender } = useTransformContext();

  const canvasTransform = useDerivedValue(() => [
    { translateX: currentTranslation.x.value },
    { translateY: currentTranslation.y.value },
    { scale: currentScale.value }
  ]);

  return (
    <Canvas onLayout={handleCanvasRender} style={styles.canvas}>
      <Group transform={canvasTransform}>{canvasChildren}</Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1
  }
});

export default memo(CanvasComponent);
