/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector } from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import {
  DirectedStraightEdgeComponentProps,
  UndirectedStraightEdgeComponentProps
} from '@/types/components';
import { EdgeComponentData, EdgeLabelComponentData } from '@/types/data';
import { Unsharedify } from '@/types/utils';
import { unsharedify } from '@/utils/objects';
import {
  addVectors,
  calcOrthogonalVector,
  calcUnitVector,
  getLineCenter,
  multiplyVector
} from '@/utils/vectors';
import { calcTranslationOnProgress, calcValueOnProgress } from '@/utils/views';

type ReactionProps = {
  label: {
    scale: number;
  };
  offsetFactor: number;
  points: Unsharedify<EdgeComponentData<unknown>['points']>;
  progress: number;
  r: number;
};

type EdgeTranslation = {
  offset: number;
  p1: Vector;
  p2: Vector;
  v1: Vector;
  v2: Vector;
};

type LabelTranslation = Unsharedify<
  EdgeLabelComponentData<unknown>['transform']
>;

export type TranslationOffsetGetter = (
  order: number,
  edgesCount: number,
  maxOffsetFactor: number,
  vertexRadius: number
) => number;

const getEdgeTransform = (
  calcTranslationOffset: TranslationOffsetGetter,
  startOffset: number,
  {
    target: { edgesCount, order }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  {
    offsetFactor,
    points: { v1Source, v1Target, v2Source, v2Target },
    progress,
    r
  }: ReactionProps
): EdgeTranslation => {
  'worklet';
  const v1 = calcTranslationOnProgress(progress, v1Source, v1Target);
  const v2 = calcTranslationOnProgress(progress, v2Source, v2Target);
  const directionVector = calcUnitVector(v2, v1);
  const targetOffset = calcTranslationOffset(
    order,
    edgesCount,
    offsetFactor,
    r
  );
  const offset = calcValueOnProgress(progress, startOffset, targetOffset);
  const translationDirection = calcOrthogonalVector(directionVector);
  const translationVector = multiplyVector(translationDirection, offset);

  return {
    offset,
    p1: addVectors(v1, translationVector),
    p2: addVectors(v2, translationVector),
    v1,
    v2
  };
};

const getLabelTransform = (
  { p1, p2, v1, v2 }: EdgeTranslation,
  startScale: number,
  {
    target: { edgesCount }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  { label, offsetFactor, progress }: ReactionProps
): LabelTranslation => {
  'worklet';
  const targetScale = Math.min(
    (2 * offsetFactor) / (edgesCount > 0 ? edgesCount - 1 : 1),
    label.scale
  );

  return {
    center: getLineCenter(p1, p2),
    p1: v1,
    p2: v2,
    scale: calcValueOnProgress(progress, startScale, targetScale)
  };
};

type CustomReactionProps<S> = ReactionProps & {
  customProps: Unsharedify<S>;
  transform: {
    edge: EdgeTranslation;
    label: LabelTranslation;
  };
};

export const useStraightEdge = <
  P extends
    | DirectedStraightEdgeComponentProps<any, any>
    | UndirectedStraightEdgeComponentProps<any, any>,
  S extends Record<string, SharedValue<any>>
>(
  inputProps: P,
  calcTranslationOffset: TranslationOffsetGetter,
  additional?: [(props: P) => S, (props: CustomReactionProps<S>) => void]
): {
  p1: SharedValue<Vector>;
  p2: SharedValue<Vector>;
} => {
  const {
    data: { label: labelData, ordering, points, transformProgress },
    renderers: { edgeLabel: edgeLabelRenderer },
    settings: {
      edge: { maxOffsetFactor },
      label: { scale: labelScale },
      vertex: { radius: vertexRadius }
    }
  } = inputProps;

  // EDGE RENDERER PROPS
  const p1 = useSharedValue({
    x: points.value.v1Source.x,
    y: points.value.v1Source.y
  });
  const p2 = useSharedValue({
    x: points.value.v2Source.x,
    y: points.value.v2Source.y
  });

  // HELPER VALUES
  // Offset
  const currentOffset = useSharedValue(0);
  const startOffset = useSharedValue(0);
  // Label scale
  const labelStartScale = useSharedValue(0);

  // ADDITIONAL PROPS
  const [selector, reaction] = additional ?? [];
  const additionalProps = selector?.(inputProps);

  useAnimatedReaction(
    () => ({
      customProps: unsharedify(additionalProps),
      label: {
        scale: labelScale.value
      },
      offsetFactor: maxOffsetFactor.value,
      points: points.value,
      progress: transformProgress.value,
      r: vertexRadius
    }),
    ({ customProps, ...props }) => {
      // EDGE
      // Update the source offset if the ordering has changed
      let beginOffset = startOffset.value;
      const currentOrdering = ordering.value;
      if (props.progress === 0) {
        beginOffset = startOffset.value = currentOffset.value;
      }
      // Get translated edge data
      const edgeTransform = getEdgeTransform(
        calcTranslationOffset,
        beginOffset,
        currentOrdering,
        props
      );

      // LABEL
      // Update label transform
      let beginScale = labelStartScale.value;
      if (props.progress === 0) {
        beginScale = labelStartScale.value = labelData.transform.value.scale;
      }
      const labelTransform = getLabelTransform(
        edgeTransform,
        beginScale,
        currentOrdering,
        props
      );
      if (edgeLabelRenderer) {
        labelData.transform.value = labelTransform;
      }

      // CUSTOM REACTION
      reaction?.({
        ...props,
        customProps,
        transform: {
          edge: edgeTransform,
          label: labelTransform
        }
      } as CustomReactionProps<S>);

      // At the end, update edge-related shared values
      p1.value = edgeTransform.p1;
      p2.value = edgeTransform.p2;
      currentOffset.value = edgeTransform.offset;
    },
    [vertexRadius, edgeLabelRenderer, additional]
  );

  return { p1, p2 };
};
