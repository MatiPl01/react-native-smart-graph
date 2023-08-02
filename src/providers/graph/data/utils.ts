import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { GraphDataContextType } from './context';

export type GraphData<V, E> =
  | DirectedGraphComponentProps<V, E>
  | UndirectedGraphComponentProps<V, E>;

export const createContextValue = <V, E>(
  userSettings: GraphData<V, E>
): GraphDataContextType<V, E> => {
  // TODO: Implement this
  return {};
};
