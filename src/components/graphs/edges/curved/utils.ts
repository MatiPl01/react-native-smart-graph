/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector } from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import {
  DirectedCurvedEdgeComponentProps,
  UndirectedCurvedEdgeComponentProps
} from '@/types/components';
import { EdgeComponentData, EdgeLabelComponentData } from '@/types/data';
import { Unsharedify } from '@/types/utils';
import { unsharedify } from '@/utils/objects';
import {
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';
import { calcTranslationOnProgress, calcValueOnProgress } from '@/utils/views';

type ReactionProps = {
  label: {
    scale: number;
  };
  points: Unsharedify<EdgeComponentData<unknown>['points']>;
  progress: number;
  r: number;
};

type EdgeTranslation = {
  labelHeight: number;
  offset: number;
  parabolaPoint: Vector;
  path: string;
  v1: Vector;
  v2: Vector;
};

export type EdgePointsOrderGetter = (v1Key: string, v2Key: string) => number;

const getEdgeTransform = (
  pointsOrder: number,
  startOffset: number,
  {
    target: { edgesCount, order }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  {
    label: { scale: labelScale },
    points: { v1Source, v1Target, v2Source, v2Target },
    progress,
    r
  }: ReactionProps
) => {
  'worklet';
  let v1 = calcTranslationOnProgress(progress, v1Source, v1Target);
  let v2 = calcTranslationOnProgress(progress, v2Source, v2Target);
  // Ensure that the order of edges is always the same
  // no matter which vertex was specified first in the edge
  // vertices array
  if (pointsOrder > 0) [v1, v2] = [v2, v1];

  const orthogonalUnitVector = calcOrthogonalUnitVector(v1, v2);
  const labelHeight = labelScale * r;
  const targetOffset = labelHeight * (order - (edgesCount - 1) / 2);
  const offset = calcValueOnProgress(progress, startOffset, targetOffset);
  const { x: parabolaX, y: parabolaY } = translateAlongVector(
    {
      x: (v1.x + v2.x) / 2,
      y: (v1.y + v2.y) / 2
    },
    orthogonalUnitVector,
    offset
  );
  const controlPoint = {
    x: parabolaX * 2 - (v1.x + v2.x) / 2,
    y: parabolaY * 2 - (v1.y + v2.y) / 2
  };

  return {
    labelHeight,
    offset,
    parabolaPoint: { x: parabolaX, y: parabolaY },
    path: `M${v1.x},${v1.y} Q${controlPoint.x},${controlPoint.y} ${v2.x},${v2.y}`,
    v1,
    v2
  };
};

const getLabelTransform = <E>(
  { parabolaPoint, v1, v2 }: EdgeTranslation,
  labelScale: number
): Unsharedify<EdgeLabelComponentData<E>['transform']> => {
  'worklet';
  return {
    center: parabolaPoint,
    p1: v1,
    p2: v2,
    scale: labelScale
  };
};

type CustomReactionProps<S> = ReactionProps & {
  customProps: Unsharedify<S>;
  transform: {
    edge: EdgeTranslation;
    label: Unsharedify<EdgeLabelComponentData<any>['transform']>;
  };
};

export const useCurvedEdge = <
  P extends
    | DirectedCurvedEdgeComponentProps<any, any>
    | UndirectedCurvedEdgeComponentProps<any, any>,
  S extends Record<string, SharedValue<any>>
>(
  inputProps: P,
  getPointsOrder: EdgePointsOrderGetter,
  additional?: [(props: P) => S, (props: CustomReactionProps<S>) => void]
): {
  path: SharedValue<string>;
} => {
  const {
    data: { label: labelData, ordering, points, transformProgress },
    renderers: { edgeLabel: edgeLabelRenderer },
    settings: {
      label: { scale: labelScale },
      vertex: { radius: vertexRadius }
    }
  } = inputProps;
  const pointsOrder = getPointsOrder(
    inputProps.data.v1Key,
    inputProps.data.v2Key
  );

  // EDGE RENDERER PROPS
  const path = useSharedValue('');

  // HELPER VALUES
  // Offset
  const currentOffset = useSharedValue(0);
  const startOffset = useSharedValue(0);

  // ADDITIONAL PROPS
  const [selector, reaction] = additional ?? [];
  const additionalProps = selector?.(inputProps);

  useAnimatedReaction(
    () => ({
      customProps: unsharedify(additionalProps),
      label: {
        scale: labelScale.value
      },
      points: points.value,
      progress: transformProgress.value,
      r: vertexRadius
    }),
    ({ customProps, ...props }) => {
      // EDGE
      // Update the source offset if the new transition started
      let beginOffset = startOffset.value;
      if (props.progress === 0) {
        beginOffset = startOffset.value = currentOffset.value;
      }
      // Get translated edge data
      const edgeTransform = getEdgeTransform(
        pointsOrder,
        beginOffset,
        ordering.value,
        props
      );

      // LABEL
      // Update label transform
      if (edgeLabelRenderer) {
        const labelTransform = getLabelTransform(
          edgeTransform,
          props.label.scale
        );
        labelData.transform.value = labelTransform;
      }

      // CUSTOM REACTION
      reaction?.({
        ...props,
        customProps,
        transform: {
          edge: edgeTransform,
          label: labelData.transform.value
        }
      } as CustomReactionProps<S>);

      // At the end, update edge-related shared values
      path.value = edgeTransform.path;
      currentOffset.value = edgeTransform.offset;
    },
    [vertexRadius, edgeLabelRenderer, additional]
  );

  return { path };
};
