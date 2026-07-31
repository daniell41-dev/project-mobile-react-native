import { requireNativeView } from 'expo';

import { IndigoCardViewProps } from './IndigoCardView.types';

export const IndigoCardView = requireNativeView<IndigoCardViewProps>('IndigoCardView');
