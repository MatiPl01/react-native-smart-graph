import { useCallback, useMemo, useRef, useState } from 'react';
import {
  GraphView,
  GraphViewControls,
  ObjectFit,
  UndirectedGraph,
  UndirectedGraphData,
  VertexPressHandler
} from 'react-native-smart-graph';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  Easing,
  Extrapolate,
  interpolate,
  makeMutable,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { UndirectedGraphComponent } from '@/components';

const GRAPH1: UndirectedGraphData = {
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V1', 'V3'] },
    { key: 'E3', vertices: ['V1', 'V4'] },
    { key: 'E12', vertices: ['V1', 'V2'] },
    { key: 'E22', vertices: ['V1', 'V3'] },
    { key: 'E32', vertices: ['V1', 'V4'] },
    { key: 'E13', vertices: ['V1', 'V2'] },
    { key: 'E23', vertices: ['V1', 'V3'] },
    { key: 'E33', vertices: ['V1', 'V4'] },
    { key: 'E14', vertices: ['V1', 'V2'] },
    { key: 'E24', vertices: ['V1', 'V3'] },
    { key: 'E34', vertices: ['V1', 'V4'] }
  ],
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }, { key: 'V4' }]
};

const GRAPH2: UndirectedGraphData = {
  edges: [
    { key: 'E221', vertices: ['V2', 'V21'] },
    { key: 'E222', vertices: ['V2', 'V22'] },
    // Back to V1
    { key: 'E12', vertices: ['V1', 'V2'] }
  ],
  vertices: [{ key: 'V2' }, { key: 'V21' }, { key: 'V22' }, { key: 'V1' }]
};

const GRAPH3: UndirectedGraphData = {
  edges: [
    { key: 'E331', vertices: ['V3', 'V31'] },
    { key: 'E332', vertices: ['V3', 'V32'] },
    { key: 'E333', vertices: ['V3', 'V33'] },
    { key: 'E334', vertices: ['V3', 'V34'] },
    { key: 'E335', vertices: ['V3', 'V35'] },
    // Back to V1
    { key: 'E13', vertices: ['V1', 'V3'] }
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

const GRAPH4: UndirectedGraphData = {
  edges: [
    { key: 'E441', vertices: ['V4', 'V41'] },
    { key: 'E442', vertices: ['V4', 'V42'] },
    { key: 'E443', vertices: ['V4', 'V43'] },
    { key: 'E444', vertices: ['V4', 'V44'] },
    { key: 'E445', vertices: ['V4', 'V45'] },
    { key: 'E446', vertices: ['V4', 'V46'] },
    { key: 'E447', vertices: ['V4', 'V47'] },
    // Back to V1
    { key: 'E14', vertices: ['V1', 'V4'] }
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

export default function BottomSheetFocus() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH1), []);
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
        padding={{
          bottom: 100,
          left: 25,
          right: 25,
          top: 50
        }}
        objectFit={objectFit}
        scales={[0.05, 1, 2, 4]}>
        <UndirectedGraphComponent
          animationSettings={{
            duration: 500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
          }}
          eventSettings={{
            press: {
              onVertexPress: handleVertexPress
            }
          }}
          // layoutSettings={
          //   {
          //     // type: 'force'
          //   }
          focusSettings={{
            points: focusPoints,
            progress: makeMutable(1),
            pointsChangeAnimationSettings: {
              duration: 1000
            }
          }}
          // }
          placementSettings={{
            strategy: 'orbits'
          }}
          graph={graph}
        />
        <GraphViewControls
          onObjectFitChange={setObjectFit}
          style={styles.controls}
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
