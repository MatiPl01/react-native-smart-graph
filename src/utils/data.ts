import { cancelAnimation } from 'react-native-reanimated';

import { VertexComponentData } from '@/types/components';

export const clearVertexComponentData = <V, E>(
  vertexData: VertexComponentData<V, E>
) => {
  cancelAnimation(vertexData.scale);
  cancelAnimation(vertexData.currentRadius);
  cancelAnimation(vertexData.position.x);
  cancelAnimation(vertexData.position.y);
};
