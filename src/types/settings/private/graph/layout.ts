import {
  AutoLayoutSettings,
  ForceLayoutSettings,
  GraphLayoutSettings
} from '@/types/settings/public';
import { DeepRequired, SharedifyWithout } from '@/types/utils';

type AllAutoLayoutSettings = DeepRequired<AutoLayoutSettings>;

export type AllForceLayoutSettings = DeepRequired<ForceLayoutSettings>;

export type AllGraphLayoutSettings = DeepRequired<GraphLayoutSettings>;

export type InternalForceLayoutSettings = SharedifyWithout<
  AllForceLayoutSettings,
  'type'
>;

export type InternalAutoLayoutSettings = SharedifyWithout<
  AllAutoLayoutSettings,
  'type'
>;

export type InternalGraphLayoutSettings = SharedifyWithout<
  AllGraphLayoutSettings,
  'type'
>;
