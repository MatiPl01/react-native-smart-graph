/* eslint-disable import/no-unused-modules */
import { Context, memo, useContext } from 'react';

import { CommonTypes } from '@/types/utils';

export const withMemoContext = <
  P extends object, // component props
  C extends object, // context value
  V extends CommonTypes<C, P> // selected values
>(
  Component: React.ComponentType<P>,
  context: Context<C>,
  selector: (contextValue: V) => Partial<V>
): React.ComponentType<Omit<P, keyof V>> => {
  const MemoComponent = memo(Component) as unknown as React.ComponentType<
    Omit<P, keyof V>
  >;

  return (props: Omit<P, keyof V>) => {
    const contextValue = useContext(context);
    const selectedValues = selector(contextValue as unknown as V);

    return <MemoComponent {...props} {...selectedValues} />;
  };
};
