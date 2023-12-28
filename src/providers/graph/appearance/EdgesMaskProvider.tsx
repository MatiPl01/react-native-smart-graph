import { Group, Rect } from '@shopify/react-native-skia';
import { createContext, memo, PropsWithChildren, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { useVertexTransform } from '@/hooks';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { useViewDataContext } from '@/providers/view';
import {
  GraphEdgesMaskProps,
  VertexMaskComponentProps,
  VertexMaskRenderer,
  VertexMaskRendererProps
} from '@/types/components';
import { RendererWithProps } from '@/types/utils';
import { useNullableContext } from '@/utils/contexts';

type EdgesMaskContextType = {
  maskComponent: React.ReactNode;
};

const EdgesMaskContext = createContext<EdgesMaskContextType | null>(null);
EdgesMaskContext.displayName = 'EdgesMaskContext';

export const useEdgesMaskContext = () => useNullableContext(EdgesMaskContext);

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
      const { boundingRect } = useViewDataContext();
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
        renderer={renderer.renderer}
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
