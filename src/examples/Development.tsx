import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Easing } from 'react-native-reanimated';

import GraphView from '@/components/views/GraphView';
import { DirectedGraph } from '@/models/graphs';

import {
  DirectedEdgeData,
  DirectedGraphComponent,
  FocusSettings,
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

const ACHIEVEMENTS_GRAPH: {
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

export default function App() {
  const graph = useMemo(() => new DirectedGraph<string, unknown>(), []);

  useEffect(() => {
    graph.insertBatch(ACHIEVEMENTS_GRAPH);
  }, [graph]);

  const [padding, setPadding] = useState(25);

  useEffect(() => {
    setInterval(() => {
      setPadding(p => (p === 25 ? 50 : 25));
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
    <GestureHandlerRootView style={styles.background}>
      <StatusBar
        backgroundColor='transparent'
        barStyle='light-content'
        translucent
      />
      <SafeAreaView style={styles.container}>
        <GraphView
          controls
          objectFit='contain'
          padding={padding}
          scales={[0.25, 1, 10]}>
          <DirectedGraphComponent
            // renderers={{
            //   label: DefaultEdgeLabelRenderer
            // }}
            // settings={{
            //   events: {
            //     onVertexLongPress: handleVertexLongPress,
            //     onVertexPress: handleVertexPress
            //   },
            //   placement: {
            //     strategy: 'circles'
            //   }
            // }}
            graph={graph}
          />
        </GraphView>
        <TouchableOpacity
          onPress={() => graph.blur(FOCUS_SETTINGS.animation)}
          style={styles.backButton}>
          <FontAwesomeIcon
            icon={faChevronLeft}
            size={32}
            style={{ color: 'white' }}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    top: 64,
    width: 32
  },
  background: {
    backgroundColor: 'black',
    flex: 1
  },
  container: {
    flex: 1,
    position: 'relative'
  }
});
