export const PLUGIN_DATA_NAMESPACE = 'figmaToMorfeo';
export const THEME_PAGE_NAME = '#Morfeo theme';

export enum PluginDataKeys {
  boxRefId = 'box-ref-id',
  currentRadiiVariants = 'current-radii-variants',
  currentBorderWidthVariants = 'current-border-width-variants',
}

export enum SliceFrameNames {
  Radius = 'Radii',
  BorderWidth = 'Border widths',
  FontSizes = 'Font sizes',
  FontWeight = 'Font weights',
  TextStyles = 'Text styles',
}

export enum Slices {
  Radius = 'Radius',
  BorderWidth = 'Border width',
  FontSizes = 'Font sizes',
  FontWeights = 'Font weights',
  LineHeights = 'Line heights',
  LetterSpacings = 'Letter spacings',
  Fonts = 'Fonts',
}

export type TextSlices = Extract<
  Slices,
  Slices.FontSizes | Slices.FontWeights | Slices.LetterSpacings | Slices.LineHeights | Slices.Fonts
>;
