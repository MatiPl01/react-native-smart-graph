import React, { PropsWithChildren, ReactElement } from 'react';
import { GraphDataContextType, withGraphData } from '../graph/data/context';
import ContextProviderComposer from './ContextProviderComposer';

type WithProvidersProps = PropsWithChildren<{
  providers: ReactElement | Array<ReactElement>;
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
  then: ReactElement | Array<ReactElement>;
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

type SwitchProviderProps<V, E, R extends string | number> = PropsWithChildren<{
  match: (data: GraphDataContextType<V, E>) => R;
  case: Record<R, ReactElement | Array<ReactElement>>;
}>;

function SwitchProvider<V, E, R extends string | number>({
  children,
  match: selector,
  case: providers
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
