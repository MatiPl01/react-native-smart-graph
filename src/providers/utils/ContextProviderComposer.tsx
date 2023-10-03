import React, { memo, PropsWithChildren } from 'react';

type ProviderWithProps<T> = {
  props: T;
  provider: React.ComponentType<T>;
};

type ProviderWithoutProps = React.ComponentType<{ children?: React.ReactNode }>;

function isProviderWithProps<T>(
  provider: ProviderWithProps<T> | ProviderWithoutProps
): provider is ProviderWithProps<T> {
  return (provider as ProviderWithProps<T>).props !== undefined;
}

export type ComposableProvider<T> = ProviderWithProps<T> | ProviderWithoutProps;

type ContextProviderComposerProps<T> = PropsWithChildren<{
  providers: Array<ComposableProvider<T>>;
}>;

function ContextProviderComposer<T>({
  children: initialChildren,
  providers
}: ContextProviderComposerProps<T>) {
  return (
    <>
      {providers.reduceRight((children, Provider) => {
        if (isProviderWithProps(Provider)) {
          return (
            <Provider.provider {...Provider.props}>
              {children}
            </Provider.provider>
          );
        }

        return <Provider>{children}</Provider>;
      }, initialChildren)}
    </>
  );
}

export default memo(ContextProviderComposer) as typeof ContextProviderComposer;
