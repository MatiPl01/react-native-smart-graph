import React, { cloneElement, PropsWithChildren } from 'react';

type ProvidersComposerProps = PropsWithChildren<{
  providers: Array<JSX.Element>;
}>;

// https://frontendbyte.com/how-to-use-react-context-api-usereducer-hooks/
export default function ProvidersComposer({
  providers,
  children: initialChildren
}: ProvidersComposerProps) {
  return (
    <>
      {providers.reduceRight(
        (children, parent) => cloneElement(parent, { children }),
        initialChildren
      )}
    </>
  );
}
