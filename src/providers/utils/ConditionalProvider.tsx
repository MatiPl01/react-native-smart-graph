import React, { PropsWithChildren, ReactElement } from 'react';

import {
  GraphDataContextType,
  withGraphData
} from '@/providers/graph/data/context';

import ContextProviderComposer from './ContextProviderComposer';

type WithProvidersProps = PropsWithChildren<{
  providers: Array<ReactElement> | ReactElement;
}>;

function WithProviders({ children, providers }: WithProvidersProps) {
  return (
    <ContextProviderComposer
      providers={Array.isArray(providers) ? providers : [providers]}>
      {children}
    </ContextProviderComposer>
  );
}

type IfProviderProps<V, E> = PropsWithChildren<{
  if: (data: GraphDataContextType<V, E>) => boolean;
  then: Array<ReactElement> | ReactElement;
}>;

function IfProvider<V, E>({
  children,
  if: selector,
  then: providers
}: IfProviderProps<V, E>) {
  return withGraphData<V, E, { rendered: boolean }, { rendered: boolean }>(
    ({ rendered }: { rendered: boolean }) => {
      return rendered ? (
        <WithProviders providers={providers}>{children}</WithProviders>
      ) : (
        <>{children}</>
      );
    },
    value => ({ rendered: selector(value) })
  )({});
}

type SwitchProviderProps<V, E, R extends number | string> = PropsWithChildren<{
  case: Record<R, Array<ReactElement> | ReactElement>;
  match: (data: GraphDataContextType<V, E>) => R;
}>;

function SwitchProvider<V, E, R extends number | string>({
  case: providers,
  children,
  match: selector
}: SwitchProviderProps<V, E, R>) {
  return withGraphData<V, E, { rendered: R }, { rendered: R }>(
    ({ rendered }: { rendered: R }) => {
      return providers[rendered] ? (
        <WithProviders providers={providers[rendered]}>
          {children}
        </WithProviders>
      ) : (
        <>{children}</>
      );
    },
    value => ({ rendered: selector(value) })
  )({});
}

const ConditionalProvider = {
  If: IfProvider,
  Switch: SwitchProvider
};

export default ConditionalProvider;
