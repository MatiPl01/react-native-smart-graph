import { useCallback, useMemo } from 'react';
import {
  DirectedEdgeData,
  DirectedGraph,
  DirectedGraphComponent,
  FocusPoints,
  GraphView,
  VertexData,
  VertexPressHandler
} from 'react-native-smart-graph';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  Extrapolate,
  interpolate,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { ListRenderItem, StyleSheet, Text, View } from 'react-native';

const GRAPH: {
  edges: DirectedEdgeData[];
  vertices: VertexData[];
} = {
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V1', to: 'V4' }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }, { key: 'V4' }]
};

const LIST_DATA = new Array(10).fill(0).map((_, index) => ({
  key: `Item ${index + 1}`
}));

export default function BottomSheetFocus() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const snapPoints = useMemo(() => ['20%', '50%', '75%'], []);
  const focusPoints = useMemo<FocusPoints>(
    () => ({
      0.5: {
        key: 'V1',
        vertexScale: 6,
        alignment: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
          verticalOffset: 100
        }
      },
      1: {
        key: 'V2',
        vertexScale: 2.5,
        alignment: {
          verticalOffset: 75,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          horizontalOffset: 25
        }
      }
    }),
    []
  );

  const animatedIndex = useSharedValue(0);
  const bottomSheetProgress = useDerivedValue(() =>
    interpolate(
      animatedIndex.value,
      [0, snapPoints.length - 1],
      [0, 1],
      Extrapolate.CLAMP
    )
  );

  const handleVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      graph.focus(key);
    },
    []
  );

  const renderItem: ListRenderItem<{ key: string }> = ({ item: { key } }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemLabel}>Item: {key}</Text>
      </View>
    );
  };

  return (
    <>
      <GraphView>
        <DirectedGraphComponent
          settings={{
            focus: {
              points: focusPoints,
              progress: bottomSheetProgress
            },
            events: {
              onVertexPress: handleVertexPress
            },
            placement: {
              strategy: 'orbits',
              minVertexSpacing: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      <BottomSheet
        animatedIndex={animatedIndex}
        index={0}
        snapPoints={snapPoints}>
        <BottomSheetFlatList data={LIST_DATA} renderItem={renderItem} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginBottom: 10
  },
  itemLabel: {
    fontSize: 18
  }
});
