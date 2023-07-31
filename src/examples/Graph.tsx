import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent,
  DefaultEdgeLabelRenderer
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V3' },
    { key: 'E4', from: 'V3', to: 'V1' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V3', to: 'V1' }
  ]
};

export default function Graph() {
  const [scale, setScale] = useState(1);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseScale = () =>
    setScale(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseScale = () =>
    setScale(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              arrow: {
                scale
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
          <TouchableOpacity onPress={decreaseScale} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{scale}</Text>
          <TouchableOpacity onPress={increaseScale} style={styles.button}>
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
