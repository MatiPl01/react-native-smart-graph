import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DirectedGraphComponent from '@/components/graphs/DirectedGraphComponent';
import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import GraphEventsProvider from './context/graphEvents';

// TODO - remove this after testing
const ADDED_COMPONENTS = [
  { from: 'V1', to: 'V2', key: 'E1', data: 'E1' },
  { from: 'V1', to: 'V2', key: 'E2', data: 'E2' },
  { from: 'V2', to: 'V1', key: 'E3', data: 'E3' },
  { key: 'V3', data: 'V3' },
  { from: 'V2', to: 'V1', key: 'E4', data: 'E4' },
  { from: 'V2', to: 'V3', key: 'E5', data: 'E5' },
  { from: 'V3', to: 'V1', key: 'E6', data: 'E6' },
  { from: 'V1', to: 'V2', key: 'E8', data: 'E8' },
  { from: 'V3', to: 'V2', key: 'E7', data: 'E7' }
];

let idx = 0;
let mode = 0;

export default function App() {
  const graph = DirectedGraph.fromData(
    [
      { key: 'V1', data: 'V1' },
      { key: 'V2', data: 'V2' }
    ],
    []
  );

  // TODO - remove this useEffect after testing
  useEffect(() => {
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
