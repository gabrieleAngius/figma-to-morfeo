import { Slices } from '../../_shared/constants';

export const defaultTheme = {
  [Slices.Radius]: { S: 3, M: 6, L: 10 },
  [Slices.BorderWidth]: { none: 0, XS: 0.5, S: 1, M: 2, L: 3 },
} satisfies Partial<Record<Slices, Record<string, number>>>;

type TextStyle = Pick<TextNode, 'fontSize' | 'fontName' | 'lineHeight' | 'letterSpacing'>;

export const defaultTextStyles: Record<string, TextStyle> = {
  P: {
    fontName: { family: 'Inter', style: 'Thin' },
    fontSize: 14,
    letterSpacing: { unit: 'PIXELS', value: 1 },
    lineHeight: { unit: 'AUTO' },
  },
  P2: {
    fontName: { family: 'Inter', style: 'Regular' },
    fontSize: 14,
    letterSpacing: { unit: 'PERCENT', value: 0 },
    lineHeight: { unit: 'AUTO' },
  },
  H1: {
    fontName: { family: 'Inter', style: 'Regular' },
    fontSize: 20,
    letterSpacing: { unit: 'PERCENT', value: 0 },
    lineHeight: { unit: 'AUTO' },
  },
  H2: {
    fontName: { family: 'Inter', style: 'Bold' },
    fontSize: 16,
    letterSpacing: { unit: 'PERCENT', value: 10 },
    lineHeight: { unit: 'AUTO' },
  },
};
