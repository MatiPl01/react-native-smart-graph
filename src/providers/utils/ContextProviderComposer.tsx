import React, { cloneElement, memo, PropsWithChildren } from 'react';

type ContextProviderComposerProps = PropsWithChildren<{
  providers: Array<JSX.Element>;
}>;

// https://frontendbyte.com/how-to-use-react-context-api-usereducer-hooks/
function ContextProviderComposer({
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

export default memo(ContextProviderComposer);
