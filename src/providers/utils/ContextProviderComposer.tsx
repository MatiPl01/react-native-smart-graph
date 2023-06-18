import React, { cloneElement, PropsWithChildren } from 'react';

type ContextProviderComposerProps = PropsWithChildren<{
  providers: Array<JSX.Element>;
}>;

// https://frontendbyte.com/how-to-use-react-context-api-usereducer-hooks/
export default function ContextProviderComposer({
  children: initialChildren,
  providers
}: ContextProviderComposerProps) {
  return (
    <>
      {providers.reduceRight(
        (children, parent) => cloneElement(parent, { children }),
        initialChildren
      )}
    </>
  );
}
