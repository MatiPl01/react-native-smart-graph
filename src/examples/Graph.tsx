import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V1', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V3'] },
    { key: 'E4', vertices: ['V3', 'V1'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V3', 'V1'] }
  ]
};

export default function Graph() {
  const [sizeRatio, setSizeRatio] = useState(1);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const increaseSizeRatio = () =>
    setSizeRatio(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseSizeRatio = () =>
    setSizeRatio(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <UndirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              label: {
                sizeRatio
              }
            },
            // --- End of graph components settings ---
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
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseSizeRatio} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{sizeRatio}</Text>
          <TouchableOpacity onPress={increaseSizeRatio} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  button: {
    backgroundColor: '#edcf46',
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  radiusText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    width: 75,
    textAlign: 'center'
  }
});
