import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
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
  const [showLabels, setShowLabels] = useState(true);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const toggleLabels = () => setShowLabels(!showLabels);

  return (
    <>
      <GraphView objectFit='contain' padding={25}>
        <DirectedGraphComponent
          renderers={{
            label: showLabels ? DefaultEdgeLabelRenderer : undefined
          }}
          settings={{
            placement: {
              strategy: 'circle',
              minVertexSpacing: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <TouchableOpacity onPress={toggleLabels} style={styles.button}>
          <Text style={styles.buttonText}>
            {showLabels ? 'Hide' : 'Show'} labels
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#edcf46',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 50,
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
