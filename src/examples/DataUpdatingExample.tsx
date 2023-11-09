import FONT from '@/font';
import { Circle, Line } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  EdgeLabelRendererProps,
  GraphView,
  ResponsiveText,
  StraightEdgeRendererProps,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData,
  VertexLabelRendererProps,
  VertexRendererProps
} from 'react-native-smart-graph';

const randomColorHex = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const randomString = () => Math.random().toString(36).substring(7);

type EdgeData = {
  label: string;
  width: number;
};

type VertexData = {
  color: string;
  label: string;
};

const GRAPH: UndirectedGraphData<VertexData, EdgeData> = {
  edges: [
    { key: 'E12', vertices: ['V1', 'V2'], value: { width: 1, label: 'edge' } }
  ],
  vertices: [
    { key: 'V1', value: { color: 'red', label: 'vertex 1' } },
    { key: 'V2', value: { color: 'blue', label: 'vertex 2' } }
  ]
};

export default function DataUpdatingExample() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  useEffect(() => {
    const intervals = [
      setInterval(() => {
        graph.updateVertexValue('V1', { color: randomColorHex() });
        graph.updateVertexValue('V2', { label: randomString() });
        graph.updateEdgeValue('E12', {
          width: Math.random() * 25,
          label: randomString()
        });
      }, 1000)
    ];

    return () => {
      intervals.forEach(clearInterval);
    };
  }, []);

  const renderers = useMemo(
    () => ({
      vertex: ({ r, value: { color } }: VertexRendererProps<VertexData>) => (
        <Circle color={color} r={r} />
      ),
      vertexLabel: ({
        onMeasure,
        value: { color, label }
      }: VertexLabelRendererProps<VertexData>) => (
        <ResponsiveText
          color={color}
          font={FONT.regular}
          text={label}
          onMeasure={onMeasure}
        />
      ),
      edge: ({
        p1,
        p2,
        value: { width }
      }: StraightEdgeRendererProps<EdgeData>) => (
        <Line color='#777' p1={p1} p2={p2} strokeWidth={width} />
      ),
      edgeLabel: ({
        onMeasure,
        value: { label }
      }: EdgeLabelRendererProps<EdgeData>) => (
        <ResponsiveText
          color='white'
          font={FONT.regular}
          text={label}
          onMeasure={onMeasure}
        />
      )
    }),
    []
  );

  return (
    <GraphView>
      <UndirectedGraphComponent
        graph={graph}
        renderers={renderers}
        componentsSettings={{
          vertex: {
            radius: 30
          },
          edgeLabel: {
            scale: 1
          }
        }}
        placementSettings={{
          strategy: 'circle',
          minVertexDistance: 200
        }}
        useContextBridge
      />
    </GraphView>
  );
}
