import { Group, Rect } from '@shopify/react-native-skia';
import {
  createContext,
  memo,
  PropsWithChildren,
  useContext,
  useMemo
} from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { useVertexTransform } from '@/hooks';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import {
  GraphEdgesMaskProps,
  VertexMaskComponentProps,
  VertexMaskRenderer,
  VertexMaskRendererProps
} from '@/types/components';
import { RendererWithProps } from '@/types/utils';

type EdgesMaskContextType = {
  maskComponent: React.ReactNode;
};

const EdgesMaskContext = createContext<EdgesMaskContextType | null>(null);

export const useEdgesMaskContext = () => {
  const context = useContext(EdgesMaskContext);

  if (!context) {
    throw new Error(
      'useEdgesMaskContext must be used within a GraphEdgesMaskProvider'
    );
  }

  return context;
};

type GraphEdgesMaskProviderProps = PropsWithChildren<{
  renderer: RendererWithProps<VertexMaskRenderer> | null;
}>;

function GraphEdgesMaskProvider({
  children,
  renderer
}: GraphEdgesMaskProviderProps) {
  const contextValue = useMemo<EdgesMaskContextType>(
    () => ({
      maskComponent: renderer ? <GraphEdgesMask renderer={renderer} /> : null
    }),
    [renderer]
  );

  return (
    <EdgesMaskContext.Provider value={contextValue}>
      {children}
    </EdgesMaskContext.Provider>
  );
}

const GraphEdgesMask = withGraphSettings(
  withComponentsData(
    function <V>({
      renderer,
      vertexRadius,
      verticesData
    }: GraphEdgesMaskProps<V>) {
      // CONTEXTS
      // Canvas contexts
      const {
        dataContext: { boundingRect }
      } = useCanvasContexts();

      const {
        bottom: bottomBound,
        left: leftBound,
        right: rightBound,
        top: topBound
      } = boundingRect;
      const width = useDerivedValue(() => rightBound.value - leftBound.value);
      const height = useDerivedValue(() => bottomBound.value - topBound.value);

      return (
        <>
          <Rect
            color='white'
            height={height}
            width={width}
            x={boundingRect.left}
            y={boundingRect.top}
          />
          {Object.entries(verticesData).map(([key, data]) => (
            <VertexMask
              data={data}
              key={key}
              radius={vertexRadius}
              renderer={renderer}
            />
          ))}
        </>
      );
    },
    ({ verticesData }) => ({
      verticesData
    })
  ),
  ({ componentsSettings }) => ({
    vertexRadius: componentsSettings.vertex.radius
  })
);

function VertexMask<V>({
  data,
  radius,
  renderer
}: VertexMaskComponentProps<V>) {
  const transform = useVertexTransform(data);

  return (
    <Group transform={transform}>
      <RenderedVertexMaskComponent
        animationProgress={data.animationProgress}
        customProps={renderer.props}
        r={radius}
        renderer={renderer.fn}
        vertexKey={data.key}
      />
    </Group>
  );
}

type RenderedVertexMaskComponentProps<V> = Omit<
  VertexMaskRendererProps<V>,
  'key'
> & {
  renderer: VertexMaskRenderer<V>;
  vertexKey: string;
};

const RenderedVertexMaskComponent = memo(function RenderedVertexComponent<V>({
  renderer,
  vertexKey: key,
  ...restProps
}: RenderedVertexMaskComponentProps<V>) {
  return renderer({ key, ...restProps });
}) as <V>(props: RenderedVertexMaskComponentProps<V>) => JSX.Element;

export default withGraphSettings(GraphEdgesMaskProvider, ({ renderers }) => ({
  renderer: renderers.vertexMask
}));
