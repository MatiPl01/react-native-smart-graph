import { ContextBridge, useContextBridge } from 'its-fine';
import { createMemoProvider } from 'react-wise-memo';

export const withContextBridge = <T extends { ContextBridge: ContextBridge }>(
  Component: React.ComponentType<T>
) =>
  createMemoProvider(Component, () => {
    return { ContextBridge: useContextBridge() };
  });
