import { Context, memo, useContext } from 'react';

export const withMemoContext = <
  P extends object, // component props
  C extends object, // context value
  V = Partial<P>
>(
  Component: React.ComponentType<P>,
  context: Context<C>,
  selector: (contextValue: C) => V
): React.ComponentType<Omit<P, keyof V>> => {
  const MemoComponent = memo(Component) as unknown as React.ComponentType<
    Omit<P, keyof V>
  >;

  return function useMemoContext(props: Omit<P, keyof V>) {
    const contextValue = useContext(context);

    if (!contextValue) throw new Error('Context value is undefined');

    const selectedValues = selector(contextValue);

    return <MemoComponent {...props} {...selectedValues} />;
  };
};
