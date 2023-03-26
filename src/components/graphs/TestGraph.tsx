import { useEffect } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { Group, Rect } from '@shopify/react-native-skia';

export type RenderEvent = {
  layout: {
    width: SharedValue<number>;
    height: SharedValue<number>;
  };
};

type TestGraphPublicProps = {
  // TODO
};

type TestGraphPrivateProps = {
  onRender?: (event: RenderEvent) => void;
};

type TestGraphProps = TestGraphPublicProps & TestGraphPrivateProps;

function TestGraph({ onRender }: TestGraphProps) {
  // TODO - calculate dimensions dynamically based on rendered graph content
  const width = useSharedValue(100);
  const height = useSharedValue(100);

  useEffect(() => {
    onRender?.({
      layout: {
        width,
        height
      }
    });
  }, []);

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width.value / 2}
        height={height.value / 2}
        color='red'
      />
      <Rect
        x={width.value / 2}
        y={height.value / 2}
        width={width.value / 2}
        height={height.value / 2}
        color='blue'
      />
    </Group>
  );
}

export default (props: TestGraphPublicProps) => {
  return <TestGraph {...props} />;
};
