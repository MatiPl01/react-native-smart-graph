import { Context, memo, useContext } from 'react';

export const withMemoContext = <
  P extends object, // component props
  C extends object, // context value
  V = Partial<P>
>(
  Component: React.ComponentType<P>,
  context: Context<C | null>,
  selector: (contextValue: C) => V
): React.ComponentType<Omit<P, keyof V>> => {
  const MemoComponent = memo(Component) as unknown as React.ComponentType<
    Omit<P, keyof V>
  >;

  return function useMemoContext(props: Omit<P, keyof V>) {
    const contextValue = useContext(context);

    if (!contextValue) {
      throw new Error(
        `${context.displayName} must be used within a ${context.displayName}Provider`
      );
    }

    const selectedValues = selector(contextValue);

    return <MemoComponent {...props} {...selectedValues} />;
  };
};

export const useNullableContext = <T extends object>(
  context: Context<T | null>
): T => {
  const contextValue = useContext(context);

  if (!contextValue) {
    throw new Error(
      `${context.displayName} must be used within a ${context.displayName}Provider`
    );
  }

  return contextValue;
};
