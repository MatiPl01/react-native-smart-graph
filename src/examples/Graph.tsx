import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent,
  GraphViewControls,
  ObjectFit
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' },
    { key: 'E4', from: 'V1', to: 'V3' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V1', to: 'V3' }
  ]
};

export default function Graph() {
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <>
      <GraphView
        initialScale={0.5}
        objectFit={objectFit}
        padding={25}
        scales={[0.5, 1, 4]}>
        <DirectedGraphComponent graph={graph} />
        {/* --- GraphViewControls --- */}
        <GraphViewControls
          onObjectFitChange={setObjectFit}
          style={styles.controls}
        />
        {/* --- End of GraphViewControls --- */}
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <Text style={styles.objectFitText}>objectFit: '{objectFit}'</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // --- GraphViewControls styles ---
  controls: {
    position: 'absolute',
    right: 20,
    top: 40
  },
  // --- End of GraphViewControls styles ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  objectFitText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50
  }
});
