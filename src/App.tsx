import { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DefaultEdgeLabelRenderer from '@/components/graphs/labels/renderers/DefaultEdgeLabelRenderer';
import { DirectedGraph, UndirectedGraph } from '@/models/graphs';
import PannableScalableView from '@/views/PannableScalableView';

import DirectedGraphComponent from './components/graphs/DirectedGraphComponent';
import UndirectedGraphComponent from './components/graphs/UndirectedGraphComponent';
import { DirectedEdgeData, VertexData } from './types/data';

const GRAPH1 = {
  vertices: [
    { key: 'A', data: 'A' },
    { key: 'B', data: 'B' },
    { key: 'C', data: 'C' },
    { key: 'D', data: 'D' },
    { key: 'E', data: 'E' },
    { key: 'F', data: 'F' },
    { key: 'G', data: 'G' },
    { key: 'H', data: 'H' },
    { key: 'I', data: 'I' },
    { key: 'J', data: 'J' },
    { key: 'K', data: 'K' },
    { key: 'L', data: 'L' }
  ] as VertexData<string>[],
  edges: [
    {
      key: 'AB',
      from: 'A',
      to: 'B',
      data: 'AB'
    },
    {
      key: 'AC',
      from: 'A',
      to: 'C',
      data: 'AC'
    },
    {
      key: 'CD',
      from: 'C',
      to: 'D',
      data: 'CD'
    },
    {
      key: 'CE',
      from: 'C',
      to: 'E',
      data: 'CE'
    },
    {
      key: 'EK',
      from: 'E',
      to: 'K',
      data: 'EK'
    },
    {
      key: 'EL',
      from: 'E',
      to: 'L',
      data: 'EL'
    },
    {
      key: 'CF',
      from: 'C',
      to: 'F',
      data: 'CF'
    },
    {
      key: 'CG',
      from: 'C',
      to: 'G',
      data: 'CG'
    },
    {
      key: 'CH',
      from: 'C',
      to: 'H',
      data: 'CH'
    },
    {
      key: 'CI',
      from: 'C',
      to: 'I',
      data: 'CI'
    },
    {
      key: 'CJ',
      from: 'C',
      to: 'J',
      data: 'CJ'
    }
  ] as DirectedEdgeData<string>[]
};

export default function App() {
  const graph = DirectedGraph.fromData(GRAPH1.vertices, GRAPH1.edges);

  return (
    <SafeAreaView className='grow'>
      <GestureHandlerRootView className='grow'>
        <View className='grow bg-black'>
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
                    type: 'curved'
                  }
                }
              }}
              renderers={{
                label: DefaultEdgeLabelRenderer
              }}
            />
          </PannableScalableView>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
