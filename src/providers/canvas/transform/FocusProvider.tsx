import { PropsWithChildren } from 'react';

type FocusProviderProps = PropsWithChildren<{}>;

export default function FocusProvider({ children }: FocusProviderProps) {
  return <>{children}</>;
}
