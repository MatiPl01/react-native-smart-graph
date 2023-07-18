import { useEffect, useMemo } from 'react';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import {
  DirectedGraph,
  DirectedGraphComponent,
  type DirectedGraphData,
  GraphView
} from '@/.';

const GRAPH: DirectedGraphData = {
  edges: [],
  vertices: [{ key: '1' }, { key: '2' }, { key: '3' }]
};

export default function MultiStepFocusExample() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const focusProgress = useSharedValue(0);

  useEffect(() => {
    const timingConfig = {
      duration: 2000,
      easing: Easing.linear
    };

    focusProgress.value = withRepeat(
      withSequence(withTiming(1, timingConfig), withTiming(0, timingConfig)),
      -1
    );

    // graph.focus('1', {
    //   disableGestures: false
    // });
  }, []);

  return (
    <GraphView objectFit='contain' padding={25}>
      <DirectedGraphComponent
        settings={{
          focus: {
            points: {
              0: { key: '1' },
              0.75: { key: '2' },
              1: { key: '3' }
            },
            progress: focusProgress
          },
          placement: {
            strategy: 'circle'
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
