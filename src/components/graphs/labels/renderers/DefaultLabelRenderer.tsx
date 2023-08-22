/* eslint-disable import/no-unused-modules */

import { Box } from '@/components/utils';
import { LabelRendererProps } from '@/types/components';

export default function DefaultLabelRenderer<E>({
  animationProgress,
  centerX,
  centerY,
  edgeRotation,
  height,
  key
}: LabelRendererProps<E>) {
  const FONT_SIZE = 16;
  // const font = useFont(FONTS.rubikFont, FONT_SIZE);

  // const wrapperTransform = useDerivedValue(() => [
  //   { translateX: centerX.value },
  //   { translateY: centerY.value },
  //   { rotate: edgeRotation.value },
  //   { scale: height.value / FONT_SIZE }
  // ]);
  // // TODO - improve label centering
  // const labelTransform = useDerivedValue(() => [
  //   {
  //     translateX: ((-key.length * FONT_SIZE) / 3.25) * animationProgress.value
  //   },
  //   { translateY: (FONT_SIZE / 3) * animationProgress.value },
  //   { scale: Math.max(animationProgress.value, 0) }
  // ]);

  return <Box rotation={edgeRotation} x={centerX} y={centerY}></Box>; // TODO - implement this component

  // return (
  //   font && (
  //     <Box transform={wrapperTransform}>
  //       <Box transform={labelTransform}>
  //         <Text color='white' font={font} text={key} x={0} y={0} />
  //       </Box>
  //     </Box>
  //   )
  // );
}
