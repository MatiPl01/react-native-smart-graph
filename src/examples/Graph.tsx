import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent,
  DefaultEdgeLabelRenderer
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] },
    { key: 'E4', vertices: ['V1', 'V3'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V1', 'V3'] }
  ]
};

export default function Graph() {
  const [showLabels, setShowLabels] = useState(true);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const toggleLabels = () => setShowLabels(!showLabels);

  return (
    <>
      <GraphView objectFit='contain' padding={25}>
        <UndirectedGraphComponent
          renderers={{
            label: showLabels ? DefaultEdgeLabelRenderer : undefined
          }}
          settings={{
            placement: {
              strategy: 'circle',
              minVertexSpacing: 100
            },
            components: {
              vertex: {
                radius: 50
              }
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
