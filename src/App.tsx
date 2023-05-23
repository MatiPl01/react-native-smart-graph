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
    { key: 'Cycling', data: [] },
    { key: 'Root', data: [] }
  ],
  edges: [
    { from: 'Sport', to: 'Football', key: 'E1', data: [] },
    { from: 'Sport', to: 'Basketball', key: 'E2', data: [] },
    { from: 'Sport', to: 'Gym', key: 'E3', data: [] },
    { from: 'Sport', to: 'Running', key: 'E4', data: [] },
    { from: 'Sport', to: 'Cycling', key: 'E5', data: [] },
    { from: 'Root', to: 'Sport', key: 'E6', data: [] }
  ]
};

const GYM_GRAPH = {
  vertices: [
    { key: 'Gym', data: [] },
    { key: 'Bench Press', data: [] },
    { key: 'Squats', data: [] },
    { key: 'Deadlift', data: [] },
    { key: 'Push Ups', data: [] },
    { key: 'Sport', data: [] }
  ],
  edges: [
    { from: 'Gym', to: 'Bench Press', key: 'E1', data: [] },
    { from: 'Gym', to: 'Squats', key: 'E2', data: [] },
    { from: 'Gym', to: 'Deadlift', key: 'E3', data: [] },
    { from: 'Gym', to: 'Push Ups', key: 'E5', data: [] },
    { from: 'Sport', to: 'Gym', key: 'E6', data: [] }
  ]
};

export default function App() {
  const graph = DirectedGraph.fromData(
    CATEGORIES_GRAPH.vertices,
    CATEGORIES_GRAPH.edges
  );

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <GraphEventsProvider
            onVertexPress={({ key }) => {
              if (key === 'Sport') {
                graph.replaceBatch(SPORT_GRAPH);
              } else if (key === 'Gym') {
                graph.replaceBatch(GYM_GRAPH);
              } else if (key === 'Root') {
                graph.replaceBatch(CATEGORIES_GRAPH);
              }
            }}>
            <PannableScalableView objectFit='contain' controls>
              <DirectedGraphComponent
                graph={graph}
                settings={{
                  // TODO - fix orbits strategy padding
                  placement: {
                    strategy: 'orbits',
                    layerSizing: 'equal',
                    minVertexSpacing: 125
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
