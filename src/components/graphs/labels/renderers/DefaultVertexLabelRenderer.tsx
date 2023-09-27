import { useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { VertexLabelRendererProps } from '@/types/components';

export default function DefaultVertexLabelRenderer<V>({
  key,
  r
}: VertexLabelRendererProps<V>) {
  const font = useFont(FONTS.rubikFont, r);

  return (
    font && (
      <ResponsiveText
        color='white'
        font={font}
        horizontalAlignment='center'
        text={key}
      />
    )
  );
}
