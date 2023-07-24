import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Easing } from 'react-native-reanimated';

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
    { from: 'root', key: 'root-sport', to: 'sport', value: '' },
    { from: 'root', key: 'root-diet', to: 'diet', value: '' },
    { from: 'root', key: 'root-sleep', to: 'sleep', value: '' },
    { from: 'root', key: 'root-meditation', to: 'meditation', value: '' },
    { from: 'root', key: 'root-reading', to: 'reading', value: '' }
  ],
  vertices: [
    { key: 'root', value: 'Root' },
    { key: 'sport', value: 'Sport' },
    { key: 'diet', value: 'Diet' },
    { key: 'sleep', value: 'Sleep' },
    { key: 'meditation', value: 'Meditation' },
    { key: 'reading', value: 'Reading' }
  ]
};

export default function Development() {
  const [objectFit, setObjectFit] = useState<ObjectFit>('none');
  const graph = useMemo(() => new DirectedGraph<string, unknown>(), []);

  useEffect(() => {
    graph.insertBatch(GRAPH);
  }, [graph]);

  const [vertexSpacing, setVertexSpacing] = useState(50);

  useEffect(() => {
    setInterval(() => {
      setVertexSpacing(v => (v === 50 ? 100 : 50));
    }, 1000);
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
