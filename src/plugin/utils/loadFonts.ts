const defaultFontNames = [
  { family: 'Inter', style: 'Regular' },
  { family: 'Inter', style: 'Thin' },
  { family: 'Inter', style: 'Bold' },
];
export const loadFonts = async () => {
  const textStyles = figma.getLocalTextStyles();
  const libFonts = textStyles.map((textStyle) => figma.loadFontAsync(textStyle.fontName));
  const defaultFonts = defaultFontNames.map((font) => figma.loadFontAsync(font));
  return await Promise.all([...defaultFonts, ...libFonts]);
};
