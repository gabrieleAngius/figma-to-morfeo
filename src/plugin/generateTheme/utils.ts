import { SliceFrameNames } from '../../_shared/constants';
import { defaultTextStyles } from '../createMorfeoTheme/defaultTheme';
import { getNewFrame } from '../utils/utils';

export const createRadiiSlices = (variants: Record<string, number>) => {
  return Object.entries(variants).map(([name, value]) => {
    const rect = figma.createRectangle();
    rect.name = name;
    rect.cornerRadius = value;
    rect.layoutAlign = 'STRETCH';
    rect.layoutPositioning = 'AUTO';
    return rect;
  });
};

export const createBorderWidthSlices = (variants: Record<string, number>) => {
  return Object.entries(variants).map(([name, value]) => {
    const line = figma.createLine();
    line.name = name;
    line.strokeWeight = value;
    line.layoutAlign = 'STRETCH';
    line.layoutPositioning = 'AUTO';
    return line;
  });
};

/**
 * It checks the existing text styles on Figma' library
 * and returns them if any, it adds some default styles on Library otherwise
 *
 * it also create a frame which display them
 */

export const generateTextStyles = (prevFrame?: SceneNode): { textStylesFrame?: SceneNode; textStyles: TextStyle[] } => {
  const existingTextStyles = figma.getLocalTextStyles();
  //TODO: add the logic to check if this frame already exist (and use it)
  const textStylesFrame = getNewFrame(SliceFrameNames.TextStyles, { previousElement: prevFrame });

  const textStyles: TextStyle[] =
    existingTextStyles.length > 0
      ? existingTextStyles
      : Object.entries(defaultTextStyles).map(([name, styles]) => {
          const textStyle = figma.createTextStyle();
          textStyle.name = name;
          textStyle.fontSize = styles.fontSize as number;
          textStyle.fontName = styles.fontName as FontName;
          textStyle.letterSpacing = styles.letterSpacing as LetterSpacing;
          textStyle.lineHeight = styles.lineHeight as LineHeight;

          return textStyle;
        });

  textStyles.forEach((textStyle) => {
    const text = figma.createText();
    text.name = textStyle.name;
    text.textStyleId = textStyle.id;
    text.characters = 'Aa';
    textStylesFrame.appendChild(text);
  });

  return { textStylesFrame, textStyles };
};
