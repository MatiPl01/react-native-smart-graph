import { Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { GraphComponent } from '@/components/graphs';
import { GraphProvider } from '@/providers/graph';
import { useViewDataContext } from '@/providers/view';
import { GraphData } from '@/types/data';

const validateProps = <V, E>(props: GraphData<V, E>) => {
  // TODO - add more validations
  // FOCUS
  // Focus points validation
  if (props.focusSettings) {
    const focusPoints = props.focusSettings.points;
    const keySet = new Set();
    for (const key in focusPoints) {
      if (+key < 0 || +key > 1) {
        throw new Error(
          `Invalid focus points: key ${key} must be between 0 and 1`
        );
      }
      if (keySet.has(key)) {
        throw new Error(
          `Invalid focus points: duplicate key ${key} found in ${JSON.stringify(
            focusPoints
          )}`
        );
      }
      keySet.add(key);
    }
  }
};

export default function GraphComponentComposer<V, E>({
  ...restProps
}: GraphData<V, E>) {
  const graphProps = restProps;
  validateProps<V, E>(graphProps);
  // CONTEXTS
  // Canvas contexts
  const dataContext = useViewDataContext();

  const { currentScale, currentTranslation } = dataContext;
  const canvasTransform = useDerivedValue(() => [
    { translateX: currentTranslation.x.value },
    { translateY: currentTranslation.y.value },
    { scale: currentScale.value }
  ]);

  const animatedTransform = useMemo(
    () => ({
      scale: currentScale,
      translateX: currentTranslation.x,
      translateY: currentTranslation.y
    }),
    []
  );

  // IMPORTANT: graphComponent must be memoized to prevent re-rendering
  const graphComponent = useMemo(() => <GraphComponent />, []);

  return (
    <Group transform={canvasTransform}>
      <GraphProvider graphProps={graphProps} transform={animatedTransform}>
        {graphComponent}
      </GraphProvider>
    </Group>
  );
}
