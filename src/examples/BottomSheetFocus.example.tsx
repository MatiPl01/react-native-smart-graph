import { useCallback, useMemo, useRef, useState } from 'react';
import {
  GraphView,
  GraphViewControls,
  ObjectFit,
  VertexPressHandler,
  DirectedGraphData,
  DirectedGraph
} from 'react-native-smart-graph';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  Easing,
  Extrapolate,
  interpolate,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { DirectedGraphComponent } from '@/components';

const GRAPH1: DirectedGraphData = {
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V1', to: 'V4' },
    { key: 'E12', from: 'V1', to: 'V2' },
    { key: 'E22', from: 'V1', to: 'V3' },
    { key: 'E32', from: 'V1', to: 'V4' },
    { key: 'E13', from: 'V1', to: 'V2' },
    { key: 'E23', from: 'V1', to: 'V3' },
    { key: 'E33', from: 'V1', to: 'V4' },
    { key: 'E14', from: 'V1', to: 'V2' },
    { key: 'E24', from: 'V1', to: 'V3' },
    { key: 'E34', from: 'V1', to: 'V4' }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }, { key: 'V4' }]
};

const GRAPH2: DirectedGraphData = {
  edges: [
    { key: 'E221', from: 'V2', to: 'V21' },
    { key: 'E222', from: 'V2', to: 'V22' },
    // Back to V1
    { key: 'E12', from: 'V1', to: 'V2' }
  ],
  vertices: [{ key: 'V2' }, { key: 'V21' }, { key: 'V22' }, { key: 'V1' }]
};

const GRAPH3: DirectedGraphData = {
  edges: [
    { key: 'E331', from: 'V3', to: 'V31' },
    { key: 'E332', from: 'V3', to: 'V32' },
    { key: 'E333', from: 'V3', to: 'V33' },
    { key: 'E334', from: 'V3', to: 'V34' },
    { key: 'E335', from: 'V3', to: 'V35' },
    // Back to V1
    { key: 'E13', from: 'V1', to: 'V3' }
  ],
  vertices: [
    { key: 'V3' },
    { key: 'V31' },
    { key: 'V32' },
    { key: 'V33' },
    { key: 'V34' },
    { key: 'V35' },
    { key: 'V1' }
  ]
};

const GRAPH4: DirectedGraphData = {
  edges: [
    { key: 'E441', from: 'V4', to: 'V41' },
    { key: 'E442', from: 'V4', to: 'V42' },
    { key: 'E443', from: 'V4', to: 'V43' },
    { key: 'E444', from: 'V4', to: 'V44' },
    { key: 'E445', from: 'V4', to: 'V45' },
    { key: 'E446', from: 'V4', to: 'V46' },
    { key: 'E447', from: 'V4', to: 'V47' },
    // Back to V1
    { key: 'E14', from: 'V1', to: 'V4' }
  ],
  vertices: [
    { key: 'V4' },
    { key: 'V41' },
    { key: 'V42' },
    { key: 'V43' },
    { key: 'V44' },
    { key: 'V45' },
    { key: 'V46' },
    { key: 'V47' },
    { key: 'V1' }
  ]
};

const GRAPH_ROUTES = {
  V1: GRAPH1,
  V2: GRAPH2,
  V3: GRAPH3,
  V4: GRAPH4
};

const LIST_DATA = new Array(10).fill(0).map((_, index) => ({
  key: `Item ${index + 1}`
}));

export default function BottomSheetFocusExample() {
  const graph = useMemo(() => new DirectedGraph(GRAPH1), []);
  const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  const bottomSheetProgress = useDerivedValue(() =>
    interpolate(
      animatedIndex.value,
      [0, snapPoints.length - 1],
      [0, 1],
      Extrapolate.CLAMP
    )
  );

  const currentRoute = useSharedValue<keyof typeof GRAPH_ROUTES>('V1');
  const focusPoints = useDerivedValue(() => ({
    0.5: {
      key: currentRoute.value,
      vertexScale: 6,
      alignment: {
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        verticalOffset: 100
      }
    },
    1: {
      key: currentRoute.value,
      vertexScale: 2,
      alignment: {
        horizontalAlignment: 'left',
        verticalAlignment: 'top',
        verticalOffset: 60,
        horizontalOffset: 20
      }
    }
  }));

  const handleVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      if (currentRoute.value === key) {
        bottomSheetRef.current?.snapToIndex(1, {
          duration: 250
        });
        return;
      }
      bottomSheetRef.current?.snapToIndex(0);
      const k = key as keyof typeof GRAPH_ROUTES;
      const target = GRAPH_ROUTES[k];
      if (!target) {
        return;
      }
      currentRoute.value = k;
      graph.replaceBatch(target);
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
      <GraphView
        objectFit={objectFit}
        scales={[0.05, 1, 2, 4]}
        padding={{
          bottom: 100,
          left: 25,
          right: 25,
          top: 50
        }}>
        <DirectedGraphComponent
          graph={graph}
          animationSettings={{
            duration: 500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
          }}
          eventSettings={{
            press: {
              onVertexPress: handleVertexPress
            }
          }}
          focusSettings={{
            points: focusPoints,
            progress: bottomSheetProgress,
            pointsChangeAnimationSettings: {
              duration: 1000
            }
          }}
          placementSettings={{
            strategy: 'orbits'
          }}
        />
        <GraphViewControls
          style={styles.controls}
          onObjectFitChange={setObjectFit}
        />
      </GraphView>
      <BottomSheet
        animatedIndex={animatedIndex}
        index={0}
        ref={bottomSheetRef}
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
  },
  controls: {
    top: 64,
    right: 16,
    position: 'absolute'
  }
});
