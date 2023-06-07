/* eslint-disable @typescript-eslint/no-non-null-assertion */

import EASING from '@/constants/easings';
import { MinPriorityQueue } from '@/data';
import {
  AnimationSettings,
  EdgeDataType,
  TimelineAnimationSettings
} from '@/types/animations';
import { VertexData } from '@/types/data';
import { isEdgeData, isVertexData } from '@/utils/models';

import { DirectedGraph, UndirectedGraph } from '..';

// TODO - implement config support
type SequenceAnimationConfig = {
  delay?: number;
  paused?: boolean;
  repeat?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  onComplete?: () => void;
  onRepeat?: () => void;
  onReverseComplete?: () => void;
  onStart: () => void;
  onUpdate?: () => void;
};

type AnimationStep = {
  fn: () => void;
  delay: number;
};

export default class GraphTimeline<
  V,
  E,
  G extends DirectedGraph<V, E> | UndirectedGraph<V, E>
> {
  private readonly steps: MinPriorityQueue<AnimationStep> =
    new MinPriorityQueue();
  private maxStartDelay = 0;
  private maxEndDelay = 0;

  constructor(
    private readonly graph: G,
    private readonly config?: SequenceAnimationConfig
  ) {}

  insertVertex(
    data: VertexData<V>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    return this.addStep(
      this.graph.insertVertex.bind(this.graph),
      data,
      duration,
      this.maxEndDelay,
      settings
    );
  }

  removeVertex(
    key: string,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    return this.addStep(
      this.graph.removeVertex.bind(this.graph),
      key,
      duration,
      this.maxEndDelay,
      settings
    );
  }

  insertEdge(
    data: EdgeDataType<G, V, E>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    return this.addStep(
      this.graph.insertEdge.bind(this.graph),
      data,
      duration,
      this.maxEndDelay,
      settings
    );
  }

  removeEdge(
    key: string,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    return this.addStep(
      this.graph.removeEdge.bind(this.graph),
      key,
      duration,
      this.maxEndDelay,
      settings
    );
  }

  insertSimultaneous(
    data: Array<VertexData<V> | EdgeDataType<V, E, G>>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    const edges = data.filter(isEdgeData);
    const vertices = data.filter(isVertexData);
    this.addStep(
      this.graph.insertBatch.bind(this.graph),
      { edges, vertices },
      duration,
      this.maxEndDelay,
      settings
    );
  }

  insertSequential(
    data:
      | Array<VertexData<V> | EdgeDataType<V, E, G>>
      | Array<Array<VertexData<V> | EdgeDataType<V, E, G>>>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    const minDelay = this.maxEndDelay;
    data.forEach((d, i) => {
      if (Array.isArray(d)) {
        this.addStep(
          this.graph.insertBatch.bind(this.graph),
          {
            edges: d.filter(isEdgeData),
            vertices: d.filter(isVertexData)
          },
          duration,
          minDelay + (i * duration) / data.length,
          settings
        );
        return;
      }
      if (isEdgeData(d)) {
        this.addStep(
          this.graph.insertEdge.bind(this.graph),
          d,
          duration,
          minDelay + (i * duration) / data.length,
          settings
        );
      } else {
        this.addStep(
          this.graph.insertVertex.bind(this.graph),
          d,
          duration,
          minDelay + (i * duration) / data.length,
          settings
        );
      }
    });
    return this;
  }

  removeSimultaneous(
    keys: Array<string>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    // TODO - implement
    return this;
  }

  removeSequential(
    keys: Array<string>,
    duration: number,
    settings?: TimelineAnimationSettings
  ) {
    // TODO - implement
    return this;
  }

  async play() {
    let currentDelay = 0;
    while (!this.steps.isEmpty()) {
      const { fn, delay } = this.steps.dequeue()!;
      // eslint-disable-next-line no-await-in-loop
      await this.sleep(delay - currentDelay);
      currentDelay = delay;
      fn();
    }
  }

  private sleep(ms: number) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private addStep<D>(
    fn: (data: D, settings?: AnimationSettings) => void,
    data: D,
    duration: number,
    delay: number,
    settings?: TimelineAnimationSettings
  ) {
    this.maxStartDelay = Math.max(this.maxStartDelay, delay);
    this.maxEndDelay = Math.max(this.maxEndDelay, delay + duration);
    this.steps.enqueue(
      {
        fn: () => {
          fn(data, {
            duration,
            easing: settings?.easing || EASING.bounce,
            onComplete: settings?.onComplete
          });
        },
        delay
      },
      delay
    );
    return this;
  }
}
