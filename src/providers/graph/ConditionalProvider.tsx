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

function wrapWithChildren<V, E, R>(
  Component: React.ComponentType<{ children?: React.ReactNode; rendered: R }>,
  selector: (data: GraphSettingsData<V, E>) => R
) {
  return function WrappedComponent({
    children
  }: {
    children?: React.ReactNode;
  }) {
    const WithSettings = withGraphSettings<
      V,
      E,
      { rendered: R },
      { rendered: R }
    >(
      ({ rendered }: { rendered: R }) => {
        return <Component rendered={rendered}>{children}</Component>;
      },
      value => ({ rendered: selector(value) })
    );
    return <WithSettings />;
  };
}

type IfProviderProps<T, V, E> = {
  if: (data: GraphSettingsData<V, E>) => boolean;
  then: Providers<T>;
};

function IfProvider<T, V, E>({
  if: selector,
  then: providers
}: IfProviderProps<T, V, E>) {
  return wrapWithChildren(({ children, rendered }) => {
    return rendered ? (
      <WithProviders<T> providers={providers}>{children}</WithProviders>
    ) : (
      <>{children}</>
    );
  }, selector);
}

type SwitchProviderProps<T, V, E, R extends number | string> = {
  case: Record<R, Providers<T>>;
  match: (data: GraphSettingsData<V, E>) => R;
};

function SwitchProvider<T, V, E, R extends number | string>({
  case: providers,
  match: selector
}: SwitchProviderProps<T, V, E, R>) {
  return wrapWithChildren(({ children, rendered }) => {
    return providers[rendered] ? (
      <WithProviders<T> providers={providers[rendered]}>
        {children}
      </WithProviders>
    ) : (
      <>{children}</>
    );
  }, selector);
}

const ConditionalProvider = {
  if: IfProvider,
  switch: SwitchProvider
};

export default ConditionalProvider;
