import {
  ForceLayoutSettings,
  GraphLayoutSettings
} from '@/types/settings/public/graph/layout';
import { DeepRequire } from '@/types/utils';

export type AllGraphLayoutSettings = DeepRequire<GraphLayoutSettings>;

export type AllForcesStrategySettings = DeepRequire<ForceLayoutSettings>;
