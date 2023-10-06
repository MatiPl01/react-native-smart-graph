import {
  ComponentType,
  createContext,
  Fragment,
  useCallback,
  useMemo,
  useState
} from 'react';
import { StyleSheet, View } from 'react-native';
import { ComposedGesture, GestureDetector } from 'react-native-gesture-handler';

import { useNullableContext, withMemoContext } from '@/utils/contexts';

export type AccessibleOverlayContextType = {
  removeLayer: (zIndex: number) => void;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
};

type OverlayContextType = {
  layers: Record<number, JSX.Element>;
} & AccessibleOverlayContextType;

const OverlayContext = createContext<OverlayContextType | null>(null);
OverlayContext.displayName = 'OverlayContext';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [zIndex]: _, ...restLayers } = prevLayers;
      return restLayers;
    });
  }, []);

  const contextValue: OverlayContextType = useMemo(
    () => ({
      layers,
      removeLayer,
      renderLayer
    }),
    [layers]
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
}

type OverlayOutletProps = {
  gestureHandler: ComposedGesture;
};

export function OverlayOutlet({ gestureHandler }: OverlayOutletProps) {
  const contextValue = useNullableContext(OverlayContext);

  const { layers } = contextValue;

  return (
    <GestureDetector gesture={gestureHandler}>
      <View style={StyleSheet.absoluteFillObject}>
        {Object.entries(layers)
          .sort(([zIndexA], [zIndexB]) => Number(zIndexA) - Number(zIndexB))
          .map(([idx, layer]) => (
            <Fragment key={idx}>{layer}</Fragment>
          ))}
      </View>
    </GestureDetector>
  );
}

export const withOverlay = <
  P extends object // component props
>(
  Component: ComponentType<P>
) =>
  withMemoContext(
    Component,
    OverlayContext,
    ({ removeLayer, renderLayer }: AccessibleOverlayContextType) => {
      return {
        removeLayer,
        renderLayer
      };
    }
  );
