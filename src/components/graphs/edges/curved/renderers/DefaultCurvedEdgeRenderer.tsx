import { useDerivedValue } from 'react-native-reanimated';

import { CurvedEdgeRendererProps } from '@/types/components';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  path
}: CurvedEdgeRendererProps<E>) {
  const end = useDerivedValue(() => Math.min(1, animationProgress.value));

  return null; // TODO - implement this

  // return (
  //   // <Path color='#999' end={end} path={path} strokeWidth={1} style='stroke' />
  // );
}
