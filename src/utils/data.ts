import { cancelAnimation } from 'react-native-reanimated';

import { EdgeComponentData, VertexComponentData } from '@/types/components';

export const cancelVertexAnimations = <V, E>(
  vertexData: VertexComponentData<V, E>
) => {
  cancelAnimation(vertexData.scale);
  cancelAnimation(vertexData.currentRadius);
  cancelAnimation(vertexData.position.x);
  cancelAnimation(vertexData.position.y);
  cancelAnimation(vertexData.displayed);
};

export const cancelEdgeAnimations = <V, E>(
  edgeData: EdgeComponentData<V, E>
) => {
  cancelAnimation(edgeData.animationProgress);
  cancelAnimation(edgeData.displayed);
  cancelAnimation(edgeData.edgesCount);
  cancelAnimation(edgeData.order);
  cancelAnimation(edgeData.labelHeight);
  cancelAnimation(edgeData.labelPosition.x);
  cancelAnimation(edgeData.labelPosition.y);
};
