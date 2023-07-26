import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import GraphViewControls from '@/components/controls/GraphViewControls';
import GraphView from '@/components/views/GraphView';
import { DirectedGraph } from '@/models/graphs';

import {
  DefaultEdgeLabelRenderer,
  DirectedEdgeData,
  DirectedGraphComponent,
  FocusSettings,
  ObjectFit,
  VertexData,
  VertexPressHandler
} from '..';

const FOCUS_SETTINGS: FocusSettings = {
  alignment: {
    horizontalAlignment: 'left',
    horizontalOffset: 25
  },
  animation: {
    duration: 250,
    easing: Easing.inOut(Easing.ease)
  },
  disableGestures: false,
  vertexScale: 4
};

const GRAPH: {
  edges: DirectedEdgeData<string>[];
  vertices: VertexData<string>[];
} = {
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V1', to: 'V4' }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }, { key: 'V4' }]
};

export default function Development() {
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');

  const graph = useMemo(() => new DirectedGraph<string, unknown>(), []);
  const focusPoints = useMemo(
    // TODO - add information in docs about useMemo
    () => ({
      0.25: { key: 'V4' },
      0.5: { key: 'V2' },
      1: { key: 'V3' }
    }),
    []
  );

  const multiStepFocusProgress = useSharedValue(0);

  useEffect(() => {
    graph.insertBatch(GRAPH);
  }, [graph]);

  const [vertexSpacing, setVertexSpacing] = useState(50);

  useEffect(() => {
    setInterval(() => {
      setVertexSpacing(v => (v === 50 ? 150 : 50));
    }, 1000);
  }, []);

  useEffect(() => {
    multiStepFocusProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        withTiming(0, { duration: 2000, easing: Easing.linear })
      ),
      -1
    );
  }, []);

  const handleVertexLongPress = useCallback<VertexPressHandler<string>>(
    ({ vertex: { key } }) => {
      console.log('long press', key);
    },
    []
  );

  const handleVertexPress = useCallback<VertexPressHandler<string>>(
    ({ vertex: { key } }) => {
      graph.focus(key, FOCUS_SETTINGS);
    },
    [graph]
  );

  return (
    <GraphView objectFit={objectFit} padding={25} scales={[0.25, 1, 10]}>
      <DirectedGraphComponent
        renderers={{
          label: DefaultEdgeLabelRenderer
        }}
        settings={{
          events: {
            onVertexLongPress: handleVertexLongPress,
            onVertexPress: handleVertexPress
          },
          placement: {
            minVertexSpacing: vertexSpacing,
            strategy: 'orbits'
          },
          focus: {
            points: focusPoints,
            progress: multiStepFocusProgress
          }
        }}
        graph={graph}
      />
      <GraphViewControls
        onObjectFitChange={setObjectFit}
        style={styles.controls}
      />
    </GraphView>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    top: 40,
    right: 10
  }
});
