import {
  AutoLayoutSettings,
  ForceLayoutSettings,
  GraphLayoutSettings
} from '@/types/settings/public';
import { DeepRequired, SharedifyWithout, Unsharedify } from '@/types/utils';

type AllAutoLayoutSettings = DeepRequired<AutoLayoutSettings>;

export type AllForceLayoutSettings = DeepRequired<
  Unsharedify<ForceLayoutSettings>
>;

export type AllGraphLayoutSettings = DeepRequired<
  Unsharedify<GraphLayoutSettings>
>;

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
