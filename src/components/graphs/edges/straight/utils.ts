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
} from '@/types/components/private/edge';
import { EdgeComponentData, LabelComponentData } from '@/types/data';
import { Unsharedify } from '@/types/utils';
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
    displayed: boolean;
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

const getLabelTransform = <E>(
  { p1, p2, v1, v2 }: EdgeTranslation,
  startScale: number,
  {
    target: { edgesCount }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  { label, offsetFactor, progress }: ReactionProps
): Unsharedify<LabelComponentData<E>['transform']> => {
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

type CustomReactionProps<S> = ReactionProps &
  S & {
    transform: {
      edge: EdgeTranslation;
      label: Unsharedify<LabelComponentData<any>['transform']>;
    };
  };

export const useStraightEdge = <
  P extends
    | DirectedStraightEdgeComponentProps<any, any>
    | UndirectedStraightEdgeComponentProps<any, any>,
  S extends Record<string, any>
>(
  inputProps: P,
  calcTranslationOffset: TranslationOffsetGetter,
  selector?: (props: P) => S,
  reaction?: (props: CustomReactionProps<S>) => void
): {
  p1: SharedValue<Vector>;
  p2: SharedValue<Vector>;
} => {
  const {
    data: { label: labelData, ordering, points, transformProgress },
    settings: {
      edge: { maxOffsetFactor },
      label: { displayed: labelDisplayed, scale: labelScale },
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
  const additionalProps = selector?.(inputProps);

  useAnimatedReaction(
    () => ({
      label: {
        displayed: labelDisplayed.value,
        scale: labelScale.value
      },
      offsetFactor: maxOffsetFactor.value,
      points: points.value,
      progress: transformProgress.value,
      r: vertexRadius.value,
      ...additionalProps
    }),
    props => {
      // Update the source offset if the new transition started
      let beginOffset = startOffset.value;
      if (props.progress === 0) {
        beginOffset = startOffset.value = currentOffset.value;
      }
      // Get translated edge data
      const edgeTransform = getEdgeTransform(
        calcTranslationOffset,
        beginOffset,
        ordering.value,
        props
      );
      // Update label data (if it is displayed)
      if (props.label.displayed) {
        let beginScale = labelStartScale.value;
        if (props.progress === 0) {
          beginScale = labelStartScale.value = labelData.transform.value.scale;
        }
        const labelTransform = getLabelTransform(
          edgeTransform,
          beginScale,
          ordering.value,
          props
        );
        labelData.transform.value = labelTransform;
      }
      // Additional reaction
      reaction?.({
        ...props,
        transform: {
          edge: edgeTransform,
          label: labelData.transform.value
        }
      } as CustomReactionProps<S>);
      // At the end, update shared values
      p1.value = edgeTransform.p1;
      p2.value = edgeTransform.p2;
      currentOffset.value = edgeTransform.offset;
    }
  );

  return { p1, p2 };
};
