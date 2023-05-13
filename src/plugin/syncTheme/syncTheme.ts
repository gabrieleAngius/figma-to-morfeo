import {
  THEME_PAGE_NAME,
  SliceFrameNames,
  PLUGIN_DATA_NAMESPACE,
  PluginDataKeys,
  Slices,
} from '../../_shared/constants';
import { Controller } from '../../_shared/types/contoller';
import { getVariantCombinations, createInstances, setRefs } from '../utils/utils';
import { syncBorderWidthVariants, syncRadiiVariants } from './utils';

export const syncTheme: Controller = () => {
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
  const boxComponentId = themePage.getSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId);
  const boxComponent = figma.getNodeById(boxComponentId);

  if (!boxComponent || boxComponent.type !== 'COMPONENT_SET') {
    figma.notify('Cant find the BOX primitive component', { error: true });
    return;
  }

  const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame);
  const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthsFrame);

  const newRadiiCombinations = getVariantCombinations([
    { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: newRadiusSlices },
    {
      sliceName: Slices.BorderWidth,
      styleKey: 'strokeWeight',
      variants: existentBorderWidthSlices,
    },
  ]);

  const newBorderWithCombinations = getVariantCombinations([
    { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: { ...existentRadiusSlices, ...newRadiusSlices } },
    {
      sliceName: Slices.BorderWidth,
      styleKey: 'strokeWeight',
      variants: newBorderWidthSlices,
    },
  ]);

  const newBoxVariants = createInstances([...newRadiiCombinations, ...newBorderWithCombinations]);

  // add the new variants to the Box component
  newBoxVariants.instances.map((newBoxVariant) => boxComponent.appendChild(newBoxVariant));

  setRefs({ refIds: newBoxVariants.refIds?.[Slices.Radius], slices: radiiFrame.children });
  setRefs({ refIds: newBoxVariants.refIds?.[Slices.BorderWidth], slices: borderWidthsFrame.children });

  figma.notify('Components updated!');
};