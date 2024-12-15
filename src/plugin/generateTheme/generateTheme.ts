import { ActionTypes } from '../../_shared/types/actions';
import { Controller } from '../../_shared/types/controller';
import { colorNormalizer } from '../../_shared/utils/normalizers';

export const generateTheme: Controller = () => {
  const localPaintStyles = figma.getLocalPaintStyles();
  const normalizedColors = colorNormalizer(localPaintStyles);

  figma.ui.postMessage({
    type: ActionTypes.downloadFile,
    meta: normalizedColors,
  });
};
