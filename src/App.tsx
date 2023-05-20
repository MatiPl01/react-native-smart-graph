import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import GraphEventsProvider from './context/graphEvents';

// TODO - remove this after testing
const ADDED_COMPONENTS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
  // .slice(0, 5)
  .map(key => ({
    key,
    data: key
  }));

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
      { key: 'child21', data: 'child21' },
      { key: 'child22', data: 'child22' },
      { key: 'child23', data: 'child23' },
      { key: 'child24', data: 'child24' },
      { key: 'child25', data: 'child25' }
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
      },
      {
        from: 'root2',
        to: 'child21',
        data: 'root2 -> child21',
        key: 'root2-child21'
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
    ]
  );

  // TODO - remove this useEffect after testing
  useEffect(() => {
    const interval = setInterval(() => {
      if (idx < 0 || idx >= ADDED_COMPONENTS.length) {
        mode = mode === 0 ? 1 : 0;
        idx = Math.max(0, Math.min(ADDED_COMPONENTS.length - 1, idx));
      }
      const component = ADDED_COMPONENTS[idx];
      if (!component) {
        return;
      }
      try {
        if (mode === 0) {
          graph.insertVertex(component.key, component.data);
          idx++;
        } else {
          graph.removeVertex(component.key);
          idx--;
        }
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
                    strategy: 'circular',
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
