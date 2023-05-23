import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import GraphEventsProvider from './context/graphEvents';

const CATEGORIES_GRAPH = {
  vertices: [
    { key: 'Root', data: [] },
    { key: 'Sport', data: [] },
    { key: 'Health', data: [] },
    { key: 'Diet', data: [] },
    { key: 'Sleep', data: [] },
    { key: 'Work', data: [] }
  ],
  edges: [
    { from: 'Root', to: 'Sport', key: 'E1', data: [] },
    { from: 'Root', to: 'Health', key: 'E2', data: [] },
    { from: 'Root', to: 'Diet', key: 'E3', data: [] },
    { from: 'Root', to: 'Sleep', key: 'E4', data: [] },
    { from: 'Root', to: 'Work', key: 'E5', data: [] }
  ]
};

const SPORT_GRAPH = {
  vertices: [
    { key: 'Sport', data: [] },
    { key: 'Football', data: [] },
    { key: 'Basketball', data: [] },
    { key: 'Gym', data: [] },
    { key: 'Running', data: [] },
    { key: 'Cycling', data: [] }
  ],
  edges: [
    { from: 'Sport', to: 'Football', key: 'E1', data: [] },
    { from: 'Sport', to: 'Basketball', key: 'E2', data: [] },
    { from: 'Sport', to: 'Gym', key: 'E3', data: [] },
    { from: 'Sport', to: 'Running', key: 'E4', data: [] },
    { from: 'Sport', to: 'Cycling', key: 'E5', data: [] }
  ]
};

const GYM_GRAPH = {
  vertices: [
    { key: 'Gym', data: [] },
    { key: 'Bench Press', data: [] },
    { key: 'Squats', data: [] },
    { key: 'Deadlift', data: [] },
    { key: 'Push Ups', data: [] }
  ],
  edges: [
    { from: 'Gym', to: 'Bench Press', key: 'E1', data: [] },
    { from: 'Gym', to: 'Squats', key: 'E2', data: [] },
    { from: 'Gym', to: 'Deadlift', key: 'E3', data: [] },
    { from: 'Gym', to: 'Push Ups', key: 'E5', data: [] }
  ]
};

const mode = 0;

export default function App() {
  const graph = DirectedGraph.fromData(
    CATEGORIES_GRAPH.vertices,
    CATEGORIES_GRAPH.edges
  );

  // TODO - remove this useEffect after testing
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (mode === 0) {
  //       graph.removeBatch({
  //         vertices: ['child12', 'root2', 'child21', 'root']
  //       });
  //       mode = 1;
  //     } else {
  //       graph.insertBatch({
  //         vertices: [
  //           { key: 'child12', value: 'child12' },
  //           { key: 'root2', value: 'root2' },
  //           { key: 'child21', value: 'child21' },
  //           { key: 'root', value: 'root' }
  //         ]
  //       });
  //       mode = 0;
  //     }
  //   }, 1500);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <GraphEventsProvider
            onVertexPress={key => {
              console.log('vertex pressed', key);
            }}
            onVertexLongPress={key => {
              console.log('vertex long pressed', key);
            }}
            onEdgePress={key => {
              console.log('edge pressed', key);
            }}
            onEdgeLongPress={key => {
              console.log('edge long pressed', key);
            }}>
            <PannableScalableView objectFit='contain' controls>
              <DirectedGraphComponent
                graph={graph}
                settings={{
                  // TODO - fix orbits strategy padding
                  placement: {
                    strategy: 'orbits',
                    minVertexSpacing: 100
                  },
                  components: {
                    edge: {
                      type: 'straight'
                    }
                  }
                }}
                renderers={{
                  label: DefaultEdgeLabelRenderer
                }}
              />
            </PannableScalableView>
          </GraphEventsProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
