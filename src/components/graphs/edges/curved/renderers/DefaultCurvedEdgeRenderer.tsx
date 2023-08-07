/* eslint-disable import/no-unused-modules */
import { Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { CurvedEdgeRendererProps } from '@/types/components';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  path
}: CurvedEdgeRendererProps<E>) {
  const end = useDerivedValue(() => Math.min(1, animationProgress.value));

  return (
    <Path color='#999' end={end} path={path} strokeWidth={1} style='stroke' />
  );
}
