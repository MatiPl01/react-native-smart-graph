import { useEffect } from 'react';

import { Group, Rect } from '@shopify/react-native-skia';

export type MeasureEvent = {
  layout: {
    width: number;
    height: number;
  };
};

type TestGraphPublicProps = {
  // TODO
};

export type TestGraphPrivateProps = {
  onMeasure: (event: MeasureEvent) => void;
};

export type TestGraphProps = TestGraphPublicProps & TestGraphPrivateProps;

function TestGraph({ onMeasure }: TestGraphProps) {
  useEffect(() => {
    // TODO - calculate dimensions dynamically based on rendered graph content
    onMeasure?.({
      layout: {
        width: 100,
        height: 100
      }
    });
  }, []);

  return (
    <Group>
      <Rect x={0} y={0} width={50} height={50} color='red' />
      <Rect x={50} y={50} width={50} height={50} color='blue' />
    </Group>
  );
}

export default (props: TestGraphPublicProps) => {
  return <TestGraph {...(props as TestGraphProps)} />;
};
