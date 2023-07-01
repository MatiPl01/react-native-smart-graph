import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useState
} from 'react';
import { StyleSheet, View } from 'react-native';

import { CommonTypes } from '@/types/utils';
import { withMemoContext } from '@/utils/contexts';

export type AccessibleOverlayContextType = {
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
};

type OverlayContextType = {
  layers: Record<number, JSX.Element>;
} & AccessibleOverlayContextType;

const OverlayContext = createContext<OverlayContextType>({
  layers: {},
  removeLayer: () => undefined,
  renderLayer: () => undefined
});

export default function OverlayProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [layers, setLayers] = useState<Record<number, JSX.Element>>({});

  const renderLayer = useCallback((zIndex: number, layer: JSX.Element) => {
    setLayers(prevLayers => ({
      ...prevLayers,
      [zIndex]: layer
    }));
  }, []);

  const removeLayer = useCallback((zIndex: number) => {
    setLayers(prevLayers => {
      const { [zIndex]: _, ...restLayers } = prevLayers;
      return restLayers;
    });
  }, []);

  const contextValue: OverlayContextType = {
    layers,
    removeLayer,
    renderLayer
  };

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
}

export const OverlayOutlet = () => {
  const contextValue = useContext(OverlayContext);

  if (!contextValue) {
    throw new Error('OverlayOutlet must be used within a OverlayProvider');
  }

  const { layers } = contextValue;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {Object.entries(layers)
        .sort(([zIndexA], [zIndexB]) => Number(zIndexA) - Number(zIndexB))
        .map(([idx, layer]) => (
          <Fragment key={idx}>{layer}</Fragment>
        ))}
    </View>
  );
};

export const withOverlay = <
  P extends object,
  V extends CommonTypes<AccessibleOverlayContextType, P>
>(
  Component: React.ComponentType<P>
) =>
  withMemoContext<P, AccessibleOverlayContextType, V>(
    Component,
    OverlayContext as unknown as React.Context<AccessibleOverlayContextType>,
    (({ removeLayer, renderLayer }: AccessibleOverlayContextType) => {
      return {
        removeLayer,
        renderLayer
      };
    }) as unknown as (contextValue: V) => Partial<V>
  ) as <
    C extends object = P // This workaround allows passing generic prop types
  >(
    props: Omit<C, keyof V>
  ) => JSX.Element;
