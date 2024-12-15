import {
  THEME_PAGE_NAME,
  SliceFrameNames,
  Slices,
  PLUGIN_DATA_NAMESPACE,
  PluginDataKeys,
} from '../../_shared/constants';
import { Controller } from '../../_shared/types/controller';
import { createBorderWidthSlices, createRadiiSlices, generateTextStyles } from '../generateTheme/utils';
import {
  getNewFrame,
  getVariantCombinations,
  createBoxInstances,
  setRefs,
  saveCurrentBoxVariants,
  BoxVariant,
  parseTextStyles,
  generateTextSlices,
} from '../utils/utils';
import { defaultTheme } from './defaultTheme';

export const createMorfeoTheme: Controller = async () => {
  const themePage = figma.root.children.find((node) => node.name === THEME_PAGE_NAME);
  if (themePage) {
    figma.notify(`The '${THEME_PAGE_NAME}' page already exist`, { error: true, timeout: 5000 });
    return;
  }

  const page = figma.createPage();
  page.name = THEME_PAGE_NAME;
  figma.currentPage = page;

  const radiiSlices = createRadiiSlices(defaultTheme[Slices.Radius]);
  const radiiFrame = getNewFrame(SliceFrameNames.Radius);
  radiiSlices.map((radiiSlice) => radiiFrame.appendChild(radiiSlice));

  const borderWidthSlices = createBorderWidthSlices(defaultTheme[Slices.BorderWidth]);
  const borderWidthFrame = getNewFrame(SliceFrameNames.BorderWidth, { previousElement: radiiFrame });
  borderWidthSlices.map((borderWidthSlice) => borderWidthFrame.appendChild(borderWidthSlice));

  const { textStylesFrame, textStyles } = generateTextStyles(borderWidthFrame);
  const parsedTextStyles = parseTextStyles(textStyles);
  const lastTextFrame = generateTextSlices(parsedTextStyles, textStylesFrame);

  const box = getNewFrame('Box', { previousElement: lastTextFrame });

  const boxCombinations = getVariantCombinations<BoxVariant>([
    { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: defaultTheme[Slices.Radius] },
    {
      sliceName: Slices.BorderWidth,
      styleKey: 'strokeWeight',
      variants: defaultTheme[Slices.BorderWidth],
    },
  ]);
  const boxVariants = createBoxInstances(boxCombinations);
  const boxComponent = figma.combineAsVariants(boxVariants.instances, box);

  // set the ref ids
  setRefs({ refIds: boxVariants.refIds[Slices.Radius], slices: radiiSlices });
  setRefs({ refIds: boxVariants.refIds[Slices.BorderWidth], slices: borderWidthSlices });
  saveCurrentBoxVariants({
    themePage: page,
    refIds: boxVariants.refIds[Slices.Radius],
    pluginKey: PluginDataKeys.currentRadiiVariants,
  });
  saveCurrentBoxVariants({
    themePage: page,
    refIds: boxVariants.refIds[Slices.BorderWidth],
    pluginKey: PluginDataKeys.currentBorderWidthVariants,
  });

  box.resize(140, 140);
  boxComponent.clipsContent = false;
  box.clipsContent = false;
  boxComponent.name = 'Box';
  page.setSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId, boxComponent.id);
  box.locked = true;

  figma.notify('Theme page created!');
  figma.closePlugin();
};
