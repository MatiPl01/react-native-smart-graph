import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V4' },
    { key: 'E4', from: 'V2', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V7' },
    { key: 'E7', from: 'V5', to: 'V8' }
  ]
};

export default function Graph() {
  const [density, setDensity] = useState(0.5);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseDensity = () =>
    setDensity(prev => Math.min(Math.round(10 * prev + 1) / 10, 1));
  const decreaseDensity = () =>
    setDensity(prev => Math.max(Math.round(10 * prev - 1) / 10, 0.1));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            // --- Placement settings ---
            placement: {
              strategy: 'random',
              density
            }
            // --- End of placement settings ---
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseDensity} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.densityText}>{density}</Text>
          <TouchableOpacity onPress={increaseDensity} style={styles.button}>
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
    borderEndEndRadius: 5
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  densityText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    width: 75,
    textAlign: 'center'
  }
});
