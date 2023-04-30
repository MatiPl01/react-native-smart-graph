import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

const ADDED_COMPONENTS = [
  {
    key: 'B',
    data: []
  },
  {
    key: 'AB',
    from: 'A',
    to: 'B',
    data: []
  },
  {
    key: 'C',
    data: []
  },
  {
    key: 'AC',
    from: 'A',
    to: 'C',
    data: []
  },
  {
    key: 'BC',
    from: 'B',
    to: 'C',
    data: []
  },
  {
    key: 'D',
    data: []
  },
  {
    key: 'AD',
    from: 'A',
    to: 'D',
    data: []
  },
  {
    key: 'BD',
    from: 'B',
    to: 'D',
    data: []
  },
  {
    key: 'CD',
    from: 'C',
    to: 'D',
    data: []
  }
];

let idx = 0;

export default function App() {
  const graph = DirectedGraph.fromData([{ key: 'A', data: [] }]);

  useEffect(() => {
    const interval = setInterval(() => {
      const component = ADDED_COMPONENTS[idx];
      if (!component) {
        clearInterval(interval);
        return;
      }

      console.log('>>> Inserting component', component.key);

      try {
        if (component.from && component.to) {
          console.log('edge', component.from, component.to);
          graph.insertEdge(
            component.from,
            component.to,
            component.key,
            component.data
          );
        } else {
          console.log('vertex', component.key);
          graph.insertVertex(component.key, component.data);
        }
        idx++;
      } catch (e) {
        clearInterval(interval);
        console.error(e);
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView controls>
            <DirectedGraphComponent
              graph={graph}
              settings={{
                // TODO - fix orbits strategy padding
                placement: {
                  strategy: 'circular',
                  minVertexSpacing: 100
                }
              }}
              renderers={{
                edgeLabel: DefaultEdgeLabelRenderer
              }}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
