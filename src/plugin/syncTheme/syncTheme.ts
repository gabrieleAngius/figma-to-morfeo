import {
  THEME_PAGE_NAME,
  SliceFrameNames,
  PLUGIN_DATA_NAMESPACE,
  PluginDataKeys,
  Slices,
} from '../../_shared/constants';
import { Controller } from '../../_shared/types/controller';
import {
  getVariantCombinations,
  createBoxInstances,
  setRefs,
  saveCurrentBoxVariants,
  BoxVariant,
} from '../utils/utils';
import {
  ErrorMap,
  ErrorType,
  checkAndRemoveDeletedSlices,
  notifyErrorMessages,
  syncBorderWidthVariants,
  syncRadiiVariants,
} from './utils';

export const syncTheme: Controller = () => {
  const errorMap: ErrorMap = {
    [ErrorType.WRONG_ELEMENT_TYPE]: [],
    [ErrorType.MIXED_SLICE_VALUES]: [],
    [ErrorType.DUPLICATED_SLICE_NAME]: [],
  };

  const themePage = figma.root.children.find((node) => node.name === THEME_PAGE_NAME);
  if (!themePage) {
    figma.notify(
      `Cannot find a '${THEME_PAGE_NAME}' page. Please use 'Create theme page' function of the plugin before sync`,
      { error: true, timeout: 5000 }
    );
    return;
  }

  const radiiFrame = themePage.findOne(
    (node) => node.name === SliceFrameNames.Radius && node.type === 'FRAME'
  ) as FrameNode;
  const borderWidthsFrame = themePage.findOne(
    (node) => node.name === SliceFrameNames.BorderWidth && node.type === 'FRAME'
  ) as FrameNode;

  if (!radiiFrame || !borderWidthsFrame) {
    figma.notify('Cannot find all the slices. If you delete some of them, please undo that change', {
      error: true,
      timeout: 3000,
    });
    figma.closePlugin();
    return;
  }

  if (radiiFrame.children.length === 0 || borderWidthsFrame.children.length === 0) {
    figma.notify('Detected some empty slices. Please keep at least one variant for each slice', {
      error: true,
      timeout: 3000,
    });
    return;
  }

  const boxComponentId = themePage.getSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId);
  const boxComponent = figma.getNodeById(boxComponentId);

  if (!boxComponent || boxComponent.type !== 'COMPONENT_SET') {
    figma.notify('Cant find the BOX primitive component', { error: true });
    return;
  }

  const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame, errorMap);
  const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthsFrame, errorMap);

  const newRadiiCombinations = getVariantCombinations<BoxVariant>([
    { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: newRadiusSlices },
    {
      sliceName: Slices.BorderWidth,
      styleKey: 'strokeWeight',
      variants: existentBorderWidthSlices,
    },
  ]);

  const newBorderWithCombinations = getVariantCombinations<BoxVariant>([
    { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: { ...existentRadiusSlices, ...newRadiusSlices } },
    {
      sliceName: Slices.BorderWidth,
      styleKey: 'strokeWeight',
      variants: newBorderWidthSlices,
    },
  ]);

  const newBoxVariants = createBoxInstances([...newRadiiCombinations, ...newBorderWithCombinations]);

  // add the new variants to the Box component
  newBoxVariants.instances.map((newBoxVariant) => boxComponent.appendChild(newBoxVariant));

  const existentRadiusSlicesKeys = Object.keys(existentRadiusSlices);
  const updatedCurrentRadiusVariants = checkAndRemoveDeletedSlices({
    themePage,
    existentSlicesKeys: existentRadiusSlicesKeys,
    pluginDataKey: PluginDataKeys.currentRadiiVariants,
  });

  const existentBorderWidthSlicesKeys = Object.keys(existentBorderWidthSlices);
  const updatedCurrentBorderWidthVariants = checkAndRemoveDeletedSlices({
    themePage,
    existentSlicesKeys: existentBorderWidthSlicesKeys,
    pluginDataKey: PluginDataKeys.currentBorderWidthVariants,
  });

  setRefs({ refIds: newBoxVariants.refIds?.[Slices.Radius], slices: radiiFrame.children });
  setRefs({ refIds: newBoxVariants.refIds?.[Slices.BorderWidth], slices: borderWidthsFrame.children });
  saveCurrentBoxVariants({
    themePage,
    refIds: { ...newBoxVariants.refIds?.[Slices.Radius], ...updatedCurrentRadiusVariants },
    pluginKey: PluginDataKeys.currentRadiiVariants,
  });
  saveCurrentBoxVariants({
    themePage,
    refIds: { ...newBoxVariants.refIds?.[Slices.BorderWidth], ...updatedCurrentBorderWidthVariants },
    pluginKey: PluginDataKeys.currentBorderWidthVariants,
  });
  notifyErrorMessages(errorMap);
};
