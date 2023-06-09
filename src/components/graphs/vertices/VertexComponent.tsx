import { memo, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { AnimationSettingsWithDefaults } from '@/types/animations';
import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { VertexSettings } from '@/types/settings';
import { updateComponentAnimationState } from '@/utils/components';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<VertexSettings>;
  renderer: VertexRenderFunction<V>;
  animationSettings: AnimationSettingsWithDefaults;
  removed: boolean;
  onRender: (
    key: string,
    positions: {
      displayed: AnimatedVectorCoordinates;
      target: AnimatedVectorCoordinates;
    }
  ) => void;
  onRemove: (key: string) => void;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  renderer,
  removed,
  onRender,
  onRemove,
  animationSettings
}: VertexComponentProps<V, E>) {
  const key = vertex.key;

  // POSITION
  // Displayed vertex position (where it is rendered)
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  // Placement vertex position (where it should be rendered in the calculated layout)
  const targetX = useSharedValue(0);
  const targetY = useSharedValue(0);

  // ANIMATION
  // Vertex render animation progress
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    // Call onRender callback on mount
    onRender(key, {
      displayed: { x: positionX, y: positionY },
      target: { x: targetX, y: targetY }
    });
  }, [key]);

  useEffect(() => {
    updateComponentAnimationState(
      key,
      animationProgress,
      animationSettings,
      removed,
      onRemove
    );
  }, [removed, animationSettings]);

  // Render the vertex component
  return renderer({
    key,
    data: vertex.value,
    radius: settings.radius,
    position: { x: positionX, y: positionY },
    animationProgress
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;
