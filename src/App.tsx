import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import UndirectedGraphComponent from './components/graphs/UndirectedGraphComponent';

// TODO - remove this after testing
const ADDED_COMPONENTS = [
  {
    key: 'A',
    data: []
  },
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
  },
  {
    key: 'E',
    data: []
  },
  {
    key: 'AE',
    from: 'A',
    to: 'E',
    data: []
  },
  {
    key: 'BE',
    from: 'B',
    to: 'E',
    data: []
  },
  {
    key: 'CE',
    from: 'C',
    to: 'E',
    data: []
  },
  {
    key: 'F',
    data: []
  },
  {
    key: 'AF',
    from: 'A',
    to: 'F',
    data: []
  },
  {
    key: 'BF',
    from: 'B',
    to: 'F',
    data: []
  },
  {
    key: 'G',
    data: []
  },
  {
    key: 'H',
    data: []
  },
  {
    key: 'I',
    data: []
  },
  {
    key: 'GA',
    from: 'G',
    to: 'A',
    data: []
  },
  {
    key: 'HI',
    from: 'H',
    to: 'I',
    data: []
  },
  {
    key: 'GI',
    from: 'G',
    to: 'I',
    data: []
  },
  {
    key: 'GH',
    from: 'G',
    to: 'H',
    data: []
  },
  {
    key: 'J',
    data: []
  },
  {
    key: 'K',
    data: []
  },
  {
    key: 'JK',
    from: 'J',
    to: 'K',
    data: []
  },
  {
    key: 'JG',
    from: 'J',
    to: 'G',
    data: []
  },
  {
    key: 'JH',
    from: 'J',
    to: 'H',
    data: []
  },
  {
    key: 'JF',
    from: 'J',
    to: 'F',
    data: []
  },
  {
    key: 'JE',
    from: 'J',
    to: 'E',
    data: []
  },
  {
    key: 'JD',
    from: 'J',
    to: 'D',
    data: []
  },
  {
    key: 'JC',
    from: 'J',
    to: 'C',
    data: []
  },
  {
    key: 'JB',
    from: 'J',
    to: 'B',
    data: []
  }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = UndirectedGraph.fromData([
    { key: 'AA', data: 'AA' },
    { key: 'BB', data: 'BB' },
    { key: 'CC', data: 'CC' }
  ]);

  // TODO - remove this useEffect after testing
  useEffect(() => {
    graph.insertEdge('AA', 'BB', 'AABB', []);
    graph.insertEdge('BB', 'CC', 'BBCC', []);
    graph.insertEdge('CC', 'AA', 'CCAA', []);

    const interval = setInterval(() => {
      if (idx < 0 || idx >= ADDED_COMPONENTS.length) {
        mode = mode === 0 ? 1 : 0;
        idx = Math.max(0, Math.min(ADDED_COMPONENTS.length - 1, idx));
      }
      const component = ADDED_COMPONENTS[idx] as (typeof ADDED_COMPONENTS)[0];

      try {
        if (mode === 0) {
          if (component.from && component.to) {
            graph.insertEdge(
              component.from,
              component.to,
              component.key,
              component.data
            );
          } else {
            graph.insertVertex(component.key, component.data);
          }
          idx++;
        } else {
          if (component.from && component.to) {
            graph.removeEdge(component.key);
          } else {
            graph.removeVertex(component.key);
          }
          idx--;
        }
      } catch (e) {
        clearInterval(interval);
        console.error(e);
        return;
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
          <PannableScalableView objectFit='contain' controls>
            <UndirectedGraphComponent
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
