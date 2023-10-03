import React, { PropsWithChildren, ReactElement } from 'react';

import { ContextProviderComposer } from '@/providers/utils';
import { GraphSettingsData } from '@/types/components';

import { withGraphSettings } from './data';

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
  if: (data: GraphSettingsData<V, E>) => boolean;
  then: Array<ReactElement> | ReactElement;
}>;

function IfProvider<V, E>({
  children,
  if: selector,
  then: providers
}: IfProviderProps<V, E>) {
  const WrappedComponent = withGraphSettings<
    V,
    E,
    { rendered: boolean },
    { rendered: boolean }
  >(
    ({ rendered }: { rendered: boolean }) => {
      return rendered ? (
        <WithProviders providers={providers}>{children}</WithProviders>
      ) : (
        <>{children}</>
      );
    },
    value => ({ rendered: selector(value) })
  );

  return <WrappedComponent />;
}

type SwitchProviderProps<V, E, R extends number | string> = PropsWithChildren<{
  case: Record<R, Array<ReactElement> | ReactElement>;
  match: (data: GraphSettingsData<V, E>) => R;
}>;

function SwitchProvider<V, E, R extends number | string>({
  case: providers,
  children,
  match: selector
}: SwitchProviderProps<V, E, R>) {
  const WrappedComponent = withGraphSettings<
    V,
    E,
    { rendered: R },
    { rendered: R }
  >(
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
  );

  return <WrappedComponent />;
}

const ConditionalProvider = {
  If: IfProvider,
  Switch: SwitchProvider
};

export default ConditionalProvider;
