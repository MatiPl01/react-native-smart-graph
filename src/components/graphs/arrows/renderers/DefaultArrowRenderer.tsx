import { Box } from '@/components/utils';
import { ArrowRendererProps } from '@/types/components';

export default function DefaultArrowRenderer({
  animationProgress,
  centerPosition,
  height,
  rotation,
  width
}: ArrowRendererProps) {
  // const color = '#999';
  // const colors = [color, color, color];

  // const vertices = useDerivedValue(() => {
  //   const x = height.value / 2 - (1 - animationProgress.value) * height.value;
  //   const y = 0.35 * width.value * animationProgress.value;
  //   return [
  //     { x: -height.value / 2, y: 0 },
  //     { x, y: -y },
  //     { x, y }
  //   ];
  // }, []);

  // TODO - implement default arrow renderer
  return (
    <Box position={centerPosition} rotation={rotation}>
      {/* <Vertices colors={colors} vertices={vertices} /> */}
    </Box>
  );
}
