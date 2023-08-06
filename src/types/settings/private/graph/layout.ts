import {
  ForceLayoutSettings,
  GraphLayoutSettings
} from '@/types/settings/public/graph/layout';
import { DeepRequire, SharedifyWithout } from '@/types/utils';

export type AllGraphLayoutSettings = DeepRequire<GraphLayoutSettings>;

export type AllForcesStrategySettings = DeepRequire<ForceLayoutSettings>;

export type InternalAllGraphLayoutSettings = SharedifyWithout<
  AllGraphLayoutSettings,
  'type'
>;
