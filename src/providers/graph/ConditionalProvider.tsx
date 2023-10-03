import React, { PropsWithChildren } from 'react';

import { ContextProviderComposer } from '@/providers/utils';
import { ComposableProvider } from '@/providers/utils/ContextProviderComposer';
import { GraphSettingsData } from '@/types/components';

import { withGraphSettings } from './data';

type Providers<T> = Array<ComposableProvider<T>> | ComposableProvider<T>;

type WithProvidersProps<T> = PropsWithChildren<{
  providers: Providers<T>;
}>;

function WithProviders<T>({ children, providers }: WithProvidersProps<T>) {
  return (
    <ContextProviderComposer
      providers={Array.isArray(providers) ? providers : [providers]}>
      {children}
    </ContextProviderComposer>
  );
}

type IfProviderProps<T, V, E> = PropsWithChildren<{
  if: (data: GraphSettingsData<V, E>) => boolean;
  then: Providers<T>;
}>;

function IfProvider<T, V, E>({
  children,
  if: selector,
  then: providers
}: IfProviderProps<T, V, E>) {
  const WrappedComponent = withGraphSettings<
    V,
    E,
    { rendered: boolean },
    { rendered: boolean }
  >(
    ({ rendered }: { rendered: boolean }) => {
      return rendered ? (
        <WithProviders<T> providers={providers}>{children}</WithProviders>
      ) : (
        <>{children}</>
      );
    },
    value => ({ rendered: selector(value) })
  );

  return WrappedComponent;
}

type SwitchProviderProps<
  T,
  V,
  E,
  R extends number | string
> = PropsWithChildren<{
  case: Record<R, Providers<T>>;
  match: (data: GraphSettingsData<V, E>) => R;
}>;

function SwitchProvider<T, V, E, R extends number | string>({
  case: providers,
  children,
  match: selector
}: SwitchProviderProps<T, V, E, R>) {
  const WrappedComponent = withGraphSettings<
    V,
    E,
    { rendered: R },
    { rendered: R }
  >(
    ({ rendered }: { rendered: R }) => {
      return providers[rendered] ? (
        <WithProviders<T> providers={providers[rendered]}>
          {children}
        </WithProviders>
      ) : (
        <>{children}</>
      );
    },
    value => ({ rendered: selector(value) })
  );

  return WrappedComponent;
}

const ConditionalProvider = {
  if: IfProvider,
  switch: SwitchProvider
};

export default ConditionalProvider;
