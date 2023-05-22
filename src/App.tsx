import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import GraphEventsProvider from './context/graphEvents';

const ADDED_COMPONENTS = [
  { key: 'o1', data: 'o1' },
  { key: 'o2', data: 'o2' },
  { key: 'o3', data: 'o3' },
  { key: 'o4', data: 'o4' },
  { key: 'o5', data: 'o5' },
  { key: 'o6', data: 'o6' },
  { key: 'o7', data: 'o7' },
  { key: 'o8', data: 'o8' },
  { key: 'o9', data: 'o9' },
  {
    from: 'o2',
    to: 'o3',
    data: 'o2 -> o3',
    key: 'o2-o3'
  },
  {
    from: 'root2',
    to: 'child22',
    data: 'root2 -> child22',
    key: 'root2-child22'
  },
  {
    from: 'child22',
    to: 'child23',
    data: 'child22 -> child23',
    key: 'child22-child23'
  },
  {
    from: 'child22',
    to: 'child24',
    data: 'child22 -> child24',
    key: 'child22-child24'
  }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = DirectedGraph.fromData(
    [
      { key: 'root', data: 'root' },
      { key: 'child1', data: 'child1' },
      { key: 'child2', data: 'child2' },
      { key: 'child3', data: 'child3' },
      { key: 'child11', data: 'child11' },
      { key: 'child12', data: 'child12' },
      { key: 'root2', data: 'root2' },
      { key: 'child21', data: 'child21' }
    ],
    [
      {
        from: 'root',
        to: 'child1',
        data: 'root -> child1',
        key: 'root-child1'
      },
      {
        from: 'child1',
        to: 'child11',
        data: 'child1 -> child11',
        key: 'child1-child11'
      },
      {
        from: 'child1',
        to: 'child12',
        data: 'child1 -> child12',
        key: 'child1-child12'
      },
      {
        from: 'root',
        to: 'child2',
        data: 'root -> child2',
        key: 'root-child2'
      },
      {
        from: 'root',
        to: 'child3',
        data: 'root -> child3',
        key: 'root-child3'
      }
      // {
      //   from: 'root2',
      //   to: 'child21',
      //   data: 'root2 -> child21',
      //   key: 'root2-child21'
      // }
    ]
  );

  // TODO - remove this useEffect after testing
  useEffect(() => {
    const interval = setInterval(() => {
      if (idx < 0 || idx >= ADDED_COMPONENTS.length) {
        mode = mode === 0 ? 1 : 0;
        idx = Math.max(0, Math.min(ADDED_COMPONENTS.length - 1, idx));
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const component = ADDED_COMPONENTS[idx]!;

      try {
        if (mode === 0) {
          graph.insertEdge(
            'root2',
            'child21',
            'child22 -> child23',
            'child22-child23'
          );
        } else {
          graph.removeEdge('child22 -> child23');
        }
        mode += 1;
        mode %= 2;
      } catch (e) {
        clearInterval(interval);
        console.error(e);
        return;
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

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
                    strategy: 'tree',
                    minVertexSpacing: 100
                  },
                  components: {
                    edge: {
                      type: 'curved'
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
