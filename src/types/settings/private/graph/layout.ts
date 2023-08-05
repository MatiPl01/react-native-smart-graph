import {
  ForceLayoutSettings,
  GraphLayoutSettings
} from '@/types/settings/public/graph/layout';
import { DeepRequiredAll } from '@/types/utils';

export type AllGraphLayoutSettings = DeepRequiredAll<GraphLayoutSettings>;

export type AllForcesStrategySettings = DeepRequiredAll<ForceLayoutSettings>;
