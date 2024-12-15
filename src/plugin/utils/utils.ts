import { PLUGIN_DATA_NAMESPACE, PluginDataKeys, Slices, TextSlices } from '../../_shared/constants';
import { RefIds } from '../../_shared/types/refs';
import { getVariantName } from '../../_shared/utils/getVariantName';

type BoxStyleKeys = keyof Pick<ComponentNode, 'cornerRadius' | 'strokeWeight'>;

export type GetVariantsParams = {
  sliceName: Slices;
  variants: { [key: string]: number };
  styleKey: BoxStyleKeys;
}[];

export type BoxVariant = {
  name: string;
} & Record<BoxStyleKeys, number>;

export const getVariantCombinations = <T extends BoxVariant>(slices: GetVariantsParams): T[] => {
  const [first, ...rest] = slices;

  const combinations: T[] = Object.entries(first.variants).map(
    ([variantName, value]) =>
      ({
        name: `${first.sliceName}=${variantName}`,
        [first.styleKey]: value,
      } as T)
  );

  return rest.reduce((acc, { sliceName, variants, styleKey }) => {
    const newResult = [];

    for (const combination of acc) {
      for (const [variantName, value] of Object.entries(variants)) {
        const newObj = { ...combination };
        newObj.name = `${newObj.name}, ${sliceName}=${variantName}`;
        newObj[styleKey] = value;
        newResult.push(newObj);
      }
    }

    return newResult;
  }, combinations);
};

export const createBoxInstances = (variants: BoxVariant[]) => {
  let refIds: RefIds = {};

  const instances = variants.map((variant) => {
    const name = variant.name;
    const instance = figma.createComponent();

    instance.name = name;
    instance.cornerRadius = variant.cornerRadius;
    instance.strokeWeight = variant.strokeWeight;
    instance.layoutMode = 'HORIZONTAL';
    instance.layoutAlign = 'STRETCH';
    instance.counterAxisAlignItems = 'CENTER';
    instance.primaryAxisAlignItems = 'SPACE_BETWEEN';
    instance.counterAxisSizingMode = 'AUTO';

    instance.fills = [{ type: 'SOLID', color: { r: 52 / 255, g: 161 / 255, b: 109 / 255 } }];
    instance.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    instance.strokeAlign = 'CENTER';

    name.split(', ').forEach((slice) => {
      const [sliceName, variantName] = slice.split('=');
      refIds[sliceName] = {
        ...refIds[sliceName],
        [variantName]: refIds[sliceName]?.[variantName]
          ? (refIds[sliceName][variantName] as string).concat('/#/', instance.id)
          : instance.id,
      };
    });

    return instance;
  });

  return { instances, refIds };
};

interface GetNewFrameOptions {
  padding?: number;
  previousElement?: SceneNode;
}

export const getNewFrame = (name: string, options?: GetNewFrameOptions) => {
  const padding = options?.padding | 20;
  const previousElement = options?.previousElement;

  const frame = figma.createFrame();
  frame.resize(frame.width, 140);
  frame.name = name;
  frame.layoutMode = 'HORIZONTAL';
  frame.layoutAlign = 'INHERIT';
  frame.counterAxisAlignItems = 'CENTER';
  frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
  frame.counterAxisSizingMode = 'AUTO';
  frame.itemSpacing = padding;
  frame.paddingLeft = padding;
  frame.paddingRight = padding;
  frame.paddingTop = padding;
  frame.paddingBottom = padding;

  if (previousElement) {
    frame.y = previousElement.y + previousElement.height + 50;
  }

  return frame;
};

export const updateVariantName = ({
  instanceName,
  newVariantName,
  sliceName,
}: {
  instanceName: string;
  newVariantName: string;
  sliceName: Slices;
}) => {
  const regex = new RegExp(`${sliceName}=[^,]+`, 'i');
  const newSlice = `${sliceName}=${newVariantName}`;
  const updatedName = instanceName.slice().replace(regex, newSlice);
  return updatedName;
};

/**
 * Assign to each slice the matching
 * ref ids using setSharedPluginData
 */
export const setRefs = ({
  slices,
  refIds,
}: {
  slices: readonly SceneNode[] | DefaultShapeMixin[];
  refIds: RefIds[Slices];
}) => {
  slices.map((slice: SceneNode | DefaultShapeMixin) => {
    if (refIds?.hasOwnProperty(slice.name)) {
      slice.setSharedPluginData(PLUGIN_DATA_NAMESPACE, slice.id, refIds[slice.name]);
    }
  });
};

/**
 * Call remove() for each node found with provided id.
 *
 * Doesn't do anything if a node with such id is not found
 *
 * @param ids list of ids to be removed
 */
export const deleteNodesById = (ids: string[]) => {
  ids.map((id) => {
    const node = figma.getNodeById(id);
    if (node !== null) {
      node.remove();
    }
  });
};

type SaveCurrentBoxVariantsOptions = {
  themePage: PageNode;
  refIds: Record<string, string>;
  pluginKey: PluginDataKeys;
};

export const saveCurrentBoxVariants = ({ themePage, refIds, pluginKey }: SaveCurrentBoxVariantsOptions) => {
  const currentVariants = JSON.stringify(refIds);
  themePage.setSharedPluginData(PLUGIN_DATA_NAMESPACE, pluginKey, currentVariants);
};

export type ExtractedTextSlices = {
  fontSize: number[];
  fontWeight: number[];
  letterSpacing: { relative: number[]; absolute: number[] };
  lineHeight: { relative: (number | 'auto')[]; absolute: number[] };
  fonts: FontName[];
};

export const extractTextSlices = (textStyles: TextStyle[]) => {
  const defaultAcc: ExtractedTextSlices = {
    fontSize: [],
    fontWeight: [],
    letterSpacing: { relative: [], absolute: [] },
    lineHeight: { relative: [], absolute: [] },
    fonts: [],
  };

  return textStyles.reduce((acc, { fontName, fontSize, letterSpacing, lineHeight, id }) => {
    const text = figma.createText();
    text.textStyleId = id;

    const fontWeight = text.fontWeight === figma.mixed ? 400 : text.fontWeight;
    text.remove();

    if (!acc.fonts.some((font) => font.family === fontName.family && font.style === fontName.style)) {
      acc.fonts.push(fontName);
    }

    if (!acc.fontSize.includes(fontSize)) {
      acc.fontSize.push(fontSize);
    }

    if (!acc.fontWeight.includes(fontWeight)) {
      acc.fontWeight.push(fontWeight);
    }

    if (letterSpacing?.unit === 'PERCENT' && !acc.letterSpacing.relative.includes(letterSpacing.value)) {
      acc.letterSpacing.relative.push(letterSpacing.value);
    }

    if (letterSpacing?.unit === 'PIXELS' && !acc.letterSpacing.absolute.includes(letterSpacing.value)) {
      acc.letterSpacing.absolute.push(letterSpacing.value);
    }

    if (lineHeight?.unit === 'PERCENT' && !acc.lineHeight.relative.includes(lineHeight.value)) {
      acc.lineHeight.relative.push(lineHeight.value);
    }

    if (lineHeight?.unit === 'PIXELS' && !acc.lineHeight.absolute.includes(lineHeight.value)) {
      acc.lineHeight.absolute.push(lineHeight.value);
    }

    if (lineHeight?.unit === 'AUTO' && !acc.lineHeight.relative.includes('auto')) {
      acc.lineHeight.relative.push('auto');
    }

    return acc;
  }, defaultAcc);
};

type AssignNamesParams = (number | 'auto')[];

export const sortValues = (values: AssignNamesParams) => {
  const sortedList = [...values];
  sortedList.sort((a, b) => {
    if (a === 'auto') {
      return -1; // 'auto' should come first
    } else if (b === 'auto') {
      return 1; // 'auto' should come first
    } else {
      return a - b; // Sort numbers from smallest to largest
    }
  });
  return sortedList;
};

export const assignNames = (values: AssignNamesParams, options?: { isRelative?: boolean }) => {
  const sorted = sortValues(values);
  return sorted.reduce((acc, value, i) => {
    if (value === 'auto') {
      return { ...acc, auto: 'auto' };
    }

    if (value === 0) {
      return { ...acc, none: value };
    }

    const name = getVariantName(i);
    if (options?.isRelative) {
      const nameWithSuffix = name.concat('Relative');
      return { ...acc, [nameWithSuffix]: value };
    }

    return { ...acc, [name]: value };
  }, {});
};

export type ParsedTextStyles = Record<
  Exclude<TextSlices, Slices.Fonts>,
  {
    absolute: Record<string, number>;
    relative?: Record<string, number | 'auto'>;
  }
> & { [Slices.Fonts]: FontName[] };

export const parseTextStyles = (textStyles: TextStyle[]) => {
  const { fontSize, fontWeight, letterSpacing, lineHeight, fonts } = extractTextSlices(textStyles);

  return {
    [Slices.FontSizes]: { absolute: assignNames(fontSize) },
    [Slices.FontWeights]: { absolute: assignNames(fontWeight) },
    [Slices.LetterSpacings]: {
      relative: assignNames(letterSpacing.relative, { isRelative: true }),
      absolute: assignNames(letterSpacing.absolute),
    },
    [Slices.LineHeights]: {
      relative: assignNames(lineHeight.relative, { isRelative: true }),
      absolute: assignNames(lineHeight.absolute),
    },
    [Slices.Fonts]: fonts,
  } as ParsedTextStyles;
};

export const generateTextSlices = (parsedTextStyles: ParsedTextStyles, previousFrame?: SceneNode) => {
  //TODO: add logic to sync (check if those frames already exist, if yes delete all their children and append new texts to them)

  const weightsMap = {};

  const fontsFrame = getNewFrame(Slices.Fonts, { previousElement: previousFrame });
  Object.values(parsedTextStyles[Slices.Fonts]).forEach((value) => {
    const text = figma.createText();
    text.characters = 'Ag';
    text.fontName = value;
    text.name = `${value.family} ${value.style}`;
    weightsMap[text.fontWeight] = value;
    fontsFrame.appendChild(text);
  });

  const fontWeightsFrame = getNewFrame(Slices.FontWeights, { previousElement: fontsFrame });
  Object.entries(parsedTextStyles[Slices.FontWeights].absolute).forEach(([name, value]) => {
    const text = figma.createText();
    text.characters = name;
    text.name = name;
    text.fontName = weightsMap[value];
    fontWeightsFrame.appendChild(text);
  });

  const fontSizesFrame = getNewFrame(Slices.FontSizes, { previousElement: fontWeightsFrame });
  Object.entries(parsedTextStyles[Slices.FontSizes].absolute).forEach(([name, value]) => {
    const text = figma.createText();
    text.characters = name;
    text.name = name;
    text.fontSize = value as number;
    fontSizesFrame.appendChild(text);
  });

  const lineHeightsFrame = getNewFrame(Slices.LineHeights, { previousElement: fontSizesFrame });
  Object.entries(parsedTextStyles[Slices.LineHeights].absolute).forEach(([name, value]) => {
    const text = figma.createText();
    text.characters = name;
    text.name = name;
    text.lineHeight = { unit: 'PIXELS', value };
    lineHeightsFrame.appendChild(text);
  });
  if (parsedTextStyles[Slices.LineHeights].relative) {
    Object.entries(parsedTextStyles[Slices.LineHeights].relative).forEach(([name, value]) => {
      const text = figma.createText();
      text.characters = name;
      text.name = name;
      if (value === 'auto') {
        text.lineHeight = { unit: 'AUTO' };
      } else {
        text.lineHeight = { unit: 'PERCENT', value };
      }
      lineHeightsFrame.appendChild(text);
    });
  }

  const letterSpacingsFrame = getNewFrame(Slices.LetterSpacings, { previousElement: lineHeightsFrame });
  Object.entries(parsedTextStyles[Slices.LetterSpacings].absolute).forEach(([name, value]) => {
    const text = figma.createText();
    text.characters = name;
    text.name = name;
    text.letterSpacing = { unit: 'PIXELS', value: value };
    letterSpacingsFrame.appendChild(text);
  });
  if (parsedTextStyles[Slices.LetterSpacings].relative) {
    Object.entries(parsedTextStyles[Slices.LetterSpacings].relative).forEach(([name, value]) => {
      const text = figma.createText();
      text.characters = name;
      text.name = name;
      text.letterSpacing = { unit: 'PERCENT', value: value as number };
      letterSpacingsFrame.appendChild(text);
    });
  }

  return letterSpacingsFrame;
};
